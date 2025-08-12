from supabase import create_client, Client
from typing import List, Dict, Any, Optional
import os
import logging
from datetime import datetime
import numpy as np

logger = logging.getLogger(__name__)

class DatabaseManager:
    def __init__(self):
        self.supabase_url = os.getenv("SUPABASE_URL")
        self.supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")  # Use service role for backend
        
        # Initialize immediately to avoid async issues in routes
        if not self.supabase_url or not self.supabase_key:
            raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")
        
        self.client = create_client(self.supabase_url, self.supabase_key)
        logger.info("Database manager initialized")
        
    async def initialize(self):
        """Initialize Supabase client - keeping for backward compatibility"""
        # Already initialized in __init__
        pass
    
    async def close(self):
        """Close database connections"""
        # Supabase client doesn't need explicit closing
        pass
    
    # Agent operations
    async def create_agent(self, user_id: str, name: str, system_prompt: str) -> Dict[str, Any]:
        """Create a new agent"""
        try:
            result = self.client.table("agents").insert({
                "user_id": user_id,
                "name": name,
                "system_prompt": system_prompt
            }).execute()
            
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error creating agent: {e}")
            raise
    
    async def get_user_agents(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all agents for a user"""
        try:
            result = self.client.table("agents").select("*").eq("user_id", user_id).execute()
            return result.data
        except Exception as e:
            logger.error(f"Error getting user agents: {e}")
            raise
    
    async def get_agent(self, agent_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific agent (with ownership check)"""
        try:
            result = self.client.table("agents").select("*").eq("id", agent_id).eq("user_id", user_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error getting agent: {e}")
            raise
    
    # Knowledge Base operations
    async def create_kb_file(self, agent_id: str, file_name: str, file_url: str) -> Dict[str, Any]:
        """Create a KB file record"""
        try:
            result = self.client.table("kb_files").insert({
                "agent_id": agent_id,
                "file_name": file_name,
                "file_url": file_url
            }).execute()
            
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error creating KB file: {e}")
            raise
    
    async def create_kb_chunks(self, agent_id: str, contents: List[str], embeddings: List[List[float]]) -> List[Dict[str, Any]]:
        """Create KB chunks with embeddings"""
        try:
            chunks_data = []
            for content, embedding in zip(contents, embeddings):
                # Validate content before insertion
                if not content or not content.strip():
                    continue  # Skip empty content
                
                # Additional sanitization check
                clean_content = self._sanitize_chunk_content(content)
                if not clean_content:
                    continue  # Skip if sanitization results in empty content
                
                # Try to detect if we're using vector or JSONB column
                chunk_data = {
                    "agent_id": agent_id,
                    "content": clean_content
                }
                
                # Try vector column first, fallback to JSONB
                try:
                    chunk_data["embedding"] = embedding
                except Exception:
                    # If vector fails, try JSONB column
                    chunk_data["embedding_json"] = embedding
                
                chunks_data.append(chunk_data)
            
            if not chunks_data:
                raise ValueError("No valid chunks to insert after sanitization")
            
            result = self.client.table("kb_chunks").insert(chunks_data).execute()
            return result.data
        except Exception as e:
            logger.error(f"Error creating KB chunks: {e}")
            raise
    
    def _sanitize_chunk_content(self, content: str) -> str:
        """Sanitize content for database storage"""
        if not content:
            return ""
        
        import re
        
        # Remove null bytes and problematic control characters
        content = content.replace('\x00', '')
        content = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', ' ', content)
        
        # Normalize whitespace
        content = re.sub(r'\s+', ' ', content)
        content = content.strip()
        
        # Ensure valid UTF-8
        try:
            content.encode('utf-8')
        except UnicodeEncodeError:
            content = content.encode('utf-8', errors='replace').decode('utf-8')
        
        return content
    
    async def get_kb_chunks(self, agent_id: str) -> List[Dict[str, Any]]:
        """Get all KB chunks for an agent"""
        try:
            result = self.client.table("kb_chunks").select("*").eq("agent_id", agent_id).execute()
            return result.data
        except Exception as e:
            logger.error(f"Error getting KB chunks: {e}")
            raise
    
    async def search_kb_chunks(self, agent_id: str, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Search KB chunks using vector similarity or fallback to text search"""
        try:
            # Generate embedding for query
            from .embedding_service import EmbeddingService
            embedding_service = EmbeddingService()
            query_embedding = await embedding_service.generate_embedding(query)
            
            # Try vector similarity search first
            try:
                result = self.client.rpc(
                    "match_kb_chunks",
                    {
                        "query_embedding": query_embedding,
                        "agent_id": agent_id,
                        "match_threshold": 0.7,
                        "match_count": limit
                    }
                ).execute()
                
                if result.data:
                    return result.data
            except Exception as e:
                logger.warning(f"Vector search failed, falling back to text search: {e}")
            
            # Fallback to text-based search if vector search fails
            result = self.client.table("kb_chunks").select("*").eq("agent_id", agent_id).ilike("content", f"%{query}%").limit(limit).execute()
            return result.data
            
        except Exception as e:
            logger.error(f"Error searching KB chunks: {e}")
            raise
    
    # Conversation operations
    async def create_conversation(self, agent_id: str) -> Dict[str, Any]:
        """Create a new conversation"""
        try:
            result = self.client.table("conversations").insert({
                "agent_id": agent_id
            }).execute()
            
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error creating conversation: {e}")
            raise
    
    async def get_conversations(self, agent_id: str) -> List[Dict[str, Any]]:
        """Get all conversations for an agent"""
        try:
            result = self.client.table("conversations").select("*").eq("agent_id", agent_id).order("created_at", desc=True).execute()
            return result.data
        except Exception as e:
            logger.error(f"Error getting conversations: {e}")
            raise
    
    # Message operations
    async def create_message(self, conversation_id: str, role: str, content: str) -> Dict[str, Any]:
        """Create a new message"""
        try:
            result = self.client.table("messages").insert({
                "conversation_id": conversation_id,
                "role": role,
                "content": content
            }).execute()
            
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error creating message: {e}")
            raise
    
    async def get_conversation_messages(self, conversation_id: str, user_id: str) -> List[Dict[str, Any]]:
        """Get all messages for a conversation (with ownership check)"""
        try:
            # First verify the conversation belongs to the user
            conv_result = self.client.table("conversations").select("agent_id").eq("id", conversation_id).execute()
            if not conv_result.data:
                return []
            
            agent_id = conv_result.data[0]["agent_id"]
            
            # Check if user owns the agent
            agent_result = self.client.table("agents").select("id").eq("id", agent_id).eq("user_id", user_id).execute()
            if not agent_result.data:
                return []
            
            # Get messages
            result = self.client.table("messages").select("*").eq("conversation_id", conversation_id).order("created_at").execute()
            return result.data
        except Exception as e:
            logger.error(f"Error getting conversation messages: {e}")
            raise 