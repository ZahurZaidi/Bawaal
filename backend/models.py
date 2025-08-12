from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from uuid import UUID

# Agent models
class AgentCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: str = Field(..., min_length=1, max_length=500)

class AgentResponse(BaseModel):
    id: str
    user_id: str
    name: str
    system_prompt: str
    created_at: datetime

# Knowledge Base models
class KBFileUpload(BaseModel):
    file_name: str
    file_url: str

class KBChunkResponse(BaseModel):
    id: str
    agent_id: str
    content: str
    created_at: datetime

# Chat models
class ChatMessage(BaseModel):
    id: str
    conversation_id: str
    role: str  # "user" or "agent"
    content: str
    created_at: datetime

class ConversationResponse(BaseModel):
    id: str
    agent_id: str
    created_at: datetime
    message_count: Optional[int] = 0

# WebSocket message models
class WSMessage(BaseModel):
    type: str  # "message", "token", "end"
    content: Optional[str] = None
    message_id: Optional[str] = None

# Search models
class SearchRequest(BaseModel):
    query: str
    limit: int = Field(default=5, ge=1, le=20)

# Error models
class ErrorResponse(BaseModel):
    detail: str
    error_code: Optional[str] = None 