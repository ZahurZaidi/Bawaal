import httpx
import json
import logging
from typing import AsyncGenerator, Dict, Any
import asyncio

logger = logging.getLogger(__name__)

class OllamaClient:
    def __init__(self, base_url: str = "http://localhost:11434"):
        self.base_url = base_url
        self.model = "llama2"  # Default model, can be configured
        
    async def generate_system_prompt(self, agent_name: str, description: str) -> str:
        """Generate a system prompt for an agent using Ollama"""
        try:
            prompt = f"""
            Create a system prompt for an AI agent with the following details:
            - Name: {agent_name}
            - Description: {description}
            
            The system prompt should:
            1. Define the agent's role and personality
            2. Set behavioral guidelines
            3. Specify how to handle different types of queries
            4. Include instructions for using knowledge base context when available
            
            Generate a clear, professional system prompt:
            """
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/api/generate",
                    json={
                        "model": self.model,
                        "prompt": prompt,
                        "stream": False,
                        "options": {
                            "temperature": 0.7,
                            "top_p": 0.9
                        }
                    },
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    result = response.json()
                    return result.get("response", "").strip()
                else:
                    logger.error(f"Ollama API error: {response.status_code}")
                    # Fallback system prompt
                    return self._get_fallback_system_prompt(agent_name, description)
                    
        except Exception as e:
            logger.error(f"Error generating system prompt: {e}")
            return self._get_fallback_system_prompt(agent_name, description)
    
    def _get_fallback_system_prompt(self, agent_name: str, description: str) -> str:
        """Fallback system prompt if Ollama is unavailable"""
        return f"""You are {agent_name}, an AI assistant designed to help users with their queries.

Description: {description}

Guidelines:
1. Be helpful, accurate, and professional in your responses
2. Use the provided knowledge base context when available to give more informed answers
3. If you don't know something, be honest about it
4. Keep responses concise but comprehensive
5. Maintain a consistent and friendly tone

When knowledge base context is provided, use it to enhance your responses while staying true to your core purpose."""
    
    async def stream_chat(
        self, 
        message: str, 
        system_prompt: str, 
        context: str = ""
    ) -> AsyncGenerator[str, None]:
        """Stream chat response from Ollama"""
        try:
            # Prepare the full prompt with context
            if context:
                full_prompt = f"""Context information:
{context}

System: {system_prompt}

User: {message}

Assistant:"""
            else:
                full_prompt = f"""System: {system_prompt}

User: {message}

Assistant:"""
            
            async with httpx.AsyncClient() as client:
                async with client.stream(
                    "POST",
                    f"{self.base_url}/api/generate",
                    json={
                        "model": self.model,
                        "prompt": full_prompt,
                        "stream": True,
                        "options": {
                            "temperature": 0.7,
                            "top_p": 0.9,
                            "max_tokens": 1000
                        }
                    },
                    timeout=60.0
                ) as response:
                    if response.status_code == 200:
                        async for line in response.aiter_lines():
                            if line.strip():
                                try:
                                    data = json.loads(line)
                                    if "response" in data:
                                        yield data["response"]
                                    if data.get("done", False):
                                        break
                                except json.JSONDecodeError:
                                    continue
                    else:
                        logger.error(f"Ollama streaming error: {response.status_code}")
                        yield "I apologize, but I'm having trouble generating a response right now."
                        
        except Exception as e:
            logger.error(f"Error in stream_chat: {e}")
            yield "I apologize, but I encountered an error while processing your request."
    
    async def health_check(self) -> bool:
        """Check if Ollama is running and healthy"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{self.base_url}/api/tags", timeout=5.0)
                return response.status_code == 200
        except Exception as e:
            logger.error(f"Ollama health check failed: {e}")
            return False
    
    async def list_models(self) -> list:
        """List available Ollama models"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{self.base_url}/api/tags", timeout=10.0)
                if response.status_code == 200:
                    data = response.json()
                    return [model["name"] for model in data.get("models", [])]
                return []
        except Exception as e:
            logger.error(f"Error listing models: {e}")
            return [] 