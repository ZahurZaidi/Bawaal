from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException
from typing import List
import json
import logging
from supabase import create_client

from ..auth import get_current_user, User
from ..models import ChatMessage, ConversationResponse
from ..database import DatabaseManager
from ..ollama_client import OllamaClient
from ..config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chat", tags=["chat"])

# Initialize services
db = DatabaseManager()
ollama_client = OllamaClient()

# Initialize Supabase client
supabase = create_client(settings.supabase_url, settings.supabase_anon_key)

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: dict = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        # Don't accept here - should be done before calling this method
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]

    async def send_message(self, user_id: str, message: str):
        if user_id in self.active_connections:
            await self.active_connections[user_id].send_text(message)

manager = ConnectionManager()

@router.websocket("/{agent_id}")
async def websocket_chat(websocket: WebSocket, agent_id: str):
    """WebSocket endpoint for real-time chat with an agent"""
    logger.info(f"WebSocket connection attempt for agent: {agent_id}")
    
    try:
        # Get auth token from query params (WebSocket doesn't support Authorization header properly)
        token = websocket.query_params.get("token")
        logger.info(f"Token received: {'Yes' if token else 'No'}")
        
        if not token:
            logger.error("Missing authentication token")
            await websocket.close(code=4001, reason="Missing authentication token")
            return
        
        # Remove Bearer prefix if present
        if token.startswith("Bearer "):
            token = token[7:]
        
        # Verify token and get user before accepting connection
        try:
            logger.info("Validating token with Supabase...")
            user_response = supabase.auth.get_user(token)
            if not user_response.user:
                logger.error("Invalid token - no user returned")
                await websocket.close(code=4001, reason="Invalid token")
                return
            user_id = user_response.user.id
            logger.info(f"Token validated for user: {user_id}")
        except Exception as e:
            logger.error(f"Token validation error: {e}")
            await websocket.close(code=4001, reason="Authentication failed")
            return
        
        # Verify agent exists and user has access before accepting connection
        logger.info(f"Checking agent access for user {user_id} and agent {agent_id}")
        agent = await db.get_agent(agent_id, user_id)
        if not agent:
            logger.error(f"Agent not found or access denied for agent {agent_id}")
            await websocket.close(code=4002, reason="Agent not found or access denied")
            return
        
        # Accept WebSocket connection only after authentication
        logger.info("Accepting WebSocket connection...")
        await websocket.accept()
        await manager.connect(websocket, user_id)
        logger.info("WebSocket connection established successfully")
        
        # Create new conversation
        conversation = await db.create_conversation(agent_id)
        
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # Store user message
            user_message = await db.create_message(
                conversation_id=conversation["id"],
                role="user",
                content=message_data["message"]
            )
            
            # Retrieve relevant KB chunks
            kb_chunks = await db.search_kb_chunks(
                agent_id, 
                message_data["message"], 
                limit=5
            )
            
            # Prepare context for LLM
            context = "\n".join([chunk["content"] for chunk in kb_chunks])
            
            # Stream response from Ollama
            full_response = ""
            async for token in ollama_client.stream_chat(
                message=message_data["message"],
                system_prompt=agent["system_prompt"],
                context=context
            ):
                full_response += token
                await websocket.send_text(json.dumps({
                    "type": "token",
                    "content": token
                }))
            
            # Store agent response
            agent_response = await db.create_message(
                conversation_id=conversation["id"],
                role="agent",
                content=full_response
            )
            
            # Send end of response marker
            await websocket.send_text(json.dumps({
                "type": "end",
                "message_id": agent_response["id"]
            }))
            
    except WebSocketDisconnect:
        manager.disconnect(user_id)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        await websocket.close(code=4000, reason="Internal error")

@router.get("/logs/{agent_id}", response_model=List[ConversationResponse])
async def get_chat_logs(
    agent_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get chat conversation history for an agent"""
    try:
        # Verify agent ownership
        agent = await db.get_agent(agent_id, current_user.id)
        if not agent:
            raise HTTPException(status_code=404, detail="Agent not found")
        
        conversations = await db.get_conversations(agent_id)
        return [ConversationResponse(**conv) for conv in conversations]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting chat logs: {e}")
        raise HTTPException(status_code=500, detail="Failed to get chat logs")

@router.get("/conversations/{conversation_id}/messages", response_model=List[ChatMessage])
async def get_conversation_messages(
    conversation_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get messages for a specific conversation"""
    try:
        messages = await db.get_conversation_messages(conversation_id, current_user.id)
        return [ChatMessage(**msg) for msg in messages]
    except Exception as e:
        logger.error(f"Error getting conversation messages: {e}")
        raise HTTPException(status_code=500, detail="Failed to get messages") 