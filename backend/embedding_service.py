from sentence_transformers import SentenceTransformer
import numpy as np
import logging
from typing import List

logger = logging.getLogger(__name__)

class EmbeddingService:
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.model_name = model_name
        self.model = None
        
    async def initialize(self):
        """Initialize the embedding model"""
        try:
            self.model = SentenceTransformer(self.model_name)
            logger.info(f"Embedding model {self.model_name} loaded")
        except Exception as e:
            logger.error(f"Error loading embedding model: {e}")
            raise
    
    async def generate_embedding(self, text: str) -> List[float]:
        """Generate embedding for a single text"""
        if not self.model:
            await self.initialize()
        
        try:
            embedding = self.model.encode(text, convert_to_tensor=False)
            return embedding.tolist()
        except Exception as e:
            logger.error(f"Error generating embedding: {e}")
            raise
    
    async def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for multiple texts"""
        if not self.model:
            await self.initialize()
        
        try:
            embeddings = self.model.encode(texts, convert_to_tensor=False)
            return embeddings.tolist()
        except Exception as e:
            logger.error(f"Error generating embeddings: {e}")
            raise
    
    async def chunk_text(self, text: str, chunk_size: int = 500) -> List[str]:
        """Split text into chunks"""
        if len(text) <= chunk_size:
            return [text]
        
        chunks = []
        start = 0
        
        while start < len(text):
            end = start + chunk_size
            if end < len(text):
                # Try to break at sentence boundaries
                for i in range(end, max(start, end - 100), -1):
                    if text[i-1] in '.!?':
                        end = i
                        break
            
            chunk = text[start:end].strip()
            if chunk:
                chunks.append(chunk)
            
            start = end
        
        return chunks 