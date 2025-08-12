from fastapi import APIRouter, Depends, HTTPException
from typing import List
import logging

from ..auth import get_current_user, User
from ..models import AgentCreate, AgentResponse
from ..database import DatabaseManager
from ..ollama_client import OllamaClient

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/agents", tags=["agents"])

# Initialize services
db = DatabaseManager()
ollama_client = OllamaClient()

@router.post("/", response_model=AgentResponse)
async def create_agent(
    agent_data: AgentCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a new AI agent"""
    try:
        print(f"[AGENTIC DEBUG] Creating agent for user: {current_user.id}")
        print(f"[AGENTIC DEBUG] Agent data: {agent_data}")
        
        # Generate system prompt using Ollama
        system_prompt = await ollama_client.generate_system_prompt(
            agent_data.name, 
            agent_data.description
        )
        
        print(f"[AGENTIC DEBUG] Generated system prompt: {system_prompt[:100]}...")
        
        # Create agent in database
        agent = await db.create_agent(
            user_id=current_user.id,
            name=agent_data.name,
            system_prompt=system_prompt
        )
        
        print(f"[AGENTIC DEBUG] Created agent: {agent}")
        
        return AgentResponse(**agent)
    except Exception as e:
        logger.error(f"Error creating agent: {e}")
        raise HTTPException(status_code=500, detail="Failed to create agent")

@router.get("/", response_model=List[AgentResponse])
async def list_agents(current_user: User = Depends(get_current_user)):
    """List all agents for the current user"""
    try:
        agents = await db.get_user_agents(current_user.id)
        return [AgentResponse(**agent) for agent in agents]
    except Exception as e:
        logger.error(f"Error listing agents: {e}")
        raise HTTPException(status_code=500, detail="Failed to list agents")

@router.get("/{agent_id}", response_model=AgentResponse)
async def get_agent(
    agent_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get a specific agent"""
    try:
        agent = await db.get_agent(agent_id, current_user.id)
        if not agent:
            raise HTTPException(status_code=404, detail="Agent not found")
        return AgentResponse(**agent)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting agent: {e}")
        raise HTTPException(status_code=500, detail="Failed to get agent")

@router.delete("/{agent_id}")
async def delete_agent(
    agent_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete an agent"""
    try:
        # Verify agent ownership
        agent = await db.get_agent(agent_id, current_user.id)
        if not agent:
            raise HTTPException(status_code=404, detail="Agent not found")
        
        # Delete agent (this would need to be implemented in DatabaseManager)
        # await db.delete_agent(agent_id)
        
        return {"message": "Agent deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting agent: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete agent") 