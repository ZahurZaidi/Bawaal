-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Check if vector extension is available and enable it
DO $$
BEGIN
    -- Try to create vector extension if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector') THEN
        CREATE EXTENSION IF NOT EXISTS vector;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        -- If vector extension fails, we'll use JSONB instead
        RAISE NOTICE 'Vector extension not available, will use JSONB for embeddings';
END $$;

-- Create tables
CREATE TABLE IF NOT EXISTS public.agents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    system_prompt TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.kb_files (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create kb_chunks table with conditional vector column
DO $$
BEGIN
    -- Check if vector type exists
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vector') THEN
        -- Create table with vector column
        EXECUTE '
        CREATE TABLE IF NOT EXISTS public.kb_chunks (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
            content TEXT NOT NULL,
            embedding vector(384),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )';
        
        -- Create vector similarity index
        EXECUTE '
        CREATE INDEX IF NOT EXISTS idx_kb_chunks_embedding ON public.kb_chunks 
        USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)';
        
        RAISE NOTICE 'Created kb_chunks table with vector column';
    ELSE
        -- Create table with JSONB column as fallback
        EXECUTE '
        CREATE TABLE IF NOT EXISTS public.kb_chunks (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
            content TEXT NOT NULL,
            embedding_json JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )';
        
        -- Create GIN index for JSONB
        EXECUTE '
        CREATE INDEX IF NOT EXISTS idx_kb_chunks_embedding_json ON public.kb_chunks USING GIN (embedding_json)';
        
        RAISE NOTICE 'Created kb_chunks table with JSONB column (vector extension not available)';
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('user', 'agent')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_agents_user_id ON public.agents(user_id);
CREATE INDEX idx_kb_chunks_agent_id ON public.kb_chunks(agent_id);
CREATE INDEX idx_conversations_agent_id ON public.conversations(agent_id);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);

-- Enable RLS
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own agents" ON public.agents
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage KB files for their agents" ON public.kb_files
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.agents 
            WHERE agents.id = kb_files.agent_id 
            AND agents.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage KB chunks for their agents" ON public.kb_chunks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.agents 
            WHERE agents.id = kb_chunks.agent_id 
            AND agents.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage conversations for their agents" ON public.conversations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.agents 
            WHERE agents.id = conversations.agent_id 
            AND agents.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage messages for their conversations" ON public.messages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.conversations
            JOIN public.agents ON agents.id = conversations.agent_id
            WHERE conversations.id = messages.conversation_id 
            AND agents.user_id = auth.uid()
        )
    ); 