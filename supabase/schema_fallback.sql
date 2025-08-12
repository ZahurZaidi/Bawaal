-- Fallback schema for Supabase projects without vector extension
-- Use this if the main schema fails due to pgvector issues

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

CREATE TABLE IF NOT EXISTS public.kb_chunks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    embedding_json JSONB, -- Store embeddings as JSON array instead of vector
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- Create GIN index for JSONB embeddings (for basic text search)
CREATE INDEX IF NOT EXISTS idx_kb_chunks_embedding_json ON public.kb_chunks USING GIN (embedding_json);

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