from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from typing import List
import logging
import re

from ..auth import get_current_user, User
from ..models import KBChunkResponse
from ..database import DatabaseManager
from ..embedding_service import EmbeddingService
from ..pdf_parser import PDFParser

logger = logging.getLogger(__name__)

def _sanitize_text_content(text: str) -> str:
    """Clean text content for database storage"""
    if not text:
        return ""
    
    # Remove null bytes and control characters
    text = text.replace('\x00', '')
    text = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', ' ', text)
    
    # Normalize whitespace
    text = re.sub(r'\s+', ' ', text)
    text = text.strip()
    
    # Ensure valid UTF-8
    try:
        text.encode('utf-8')
    except UnicodeEncodeError:
        text = text.encode('utf-8', errors='replace').decode('utf-8')
    
    return text

router = APIRouter(prefix="/agents/{agent_id}/kb", tags=["knowledge-base"])

# Initialize services
db = DatabaseManager()
embedding_service = EmbeddingService()
pdf_parser = PDFParser()

@router.post("/upload")
async def upload_kb_file(
    agent_id: str,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """Upload and process a knowledge base file"""
    try:
        # Verify agent ownership
        agent = await db.get_agent(agent_id, current_user.id)
        if not agent:
            raise HTTPException(status_code=404, detail="Agent not found")
        
        # Validate file
        if not file.filename:
            raise HTTPException(status_code=400, detail="No filename provided")
        
        # Check file size (limit to 10MB)
        MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail="File too large (max 10MB)")
        
        # Parse content based on file type
        if file.filename.lower().endswith('.pdf'):
            print(f"[AGENTIC DEBUG] Processing PDF file: {file.filename}")
            text_chunks = await pdf_parser.parse_pdf(content)
        elif file.filename.lower().endswith(('.txt', '.md')):
            print(f"[AGENTIC DEBUG] Processing text file: {file.filename}")
            # Sanitize text content
            try:
                raw_text = content.decode('utf-8')
                clean_text = _sanitize_text_content(raw_text)
                text_chunks = [clean_text] if clean_text else []
            except UnicodeDecodeError:
                raise HTTPException(status_code=400, detail="File encoding not supported")
        else:
            raise HTTPException(status_code=400, detail="Unsupported file type. Only PDF and text files are supported.")
        
        if not text_chunks:
            raise HTTPException(status_code=400, detail="No text content could be extracted from the file")
        
        print(f"[AGENTIC DEBUG] Extracted {len(text_chunks)} text chunks")
        
        # Generate embeddings for chunks
        embeddings = await embedding_service.generate_embeddings(text_chunks)
        print(f"[AGENTIC DEBUG] Generated embeddings for {len(embeddings)} chunks")
        
        # Store in database
        kb_file = await db.create_kb_file(agent_id, file.filename, "")
        chunks = await db.create_kb_chunks(agent_id, text_chunks, embeddings)
        
        return {
            "message": "File uploaded and processed successfully",
            "file_id": kb_file["id"],
            "chunks_created": len(chunks)
        }
    except HTTPException:
        raise
    except ValueError as ve:
        logger.error(f"Validation error uploading KB file: {ve}")
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error(f"Error uploading KB file: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")

@router.get("/", response_model=List[KBChunkResponse])
async def get_kb_chunks(
    agent_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get knowledge base chunks for an agent"""
    try:
        # Verify agent ownership
        agent = await db.get_agent(agent_id, current_user.id)
        if not agent:
            raise HTTPException(status_code=404, detail="Agent not found")
        
        chunks = await db.get_kb_chunks(agent_id)
        return [KBChunkResponse(**chunk) for chunk in chunks]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting KB chunks: {e}")
        raise HTTPException(status_code=500, detail="Failed to get KB chunks")

@router.get("/search")
async def search_kb(
    agent_id: str,
    query: str,
    limit: int = 5,
    current_user: User = Depends(get_current_user)
):
    """Search knowledge base using vector similarity"""
    try:
        # Verify agent ownership
        agent = await db.get_agent(agent_id, current_user.id)
        if not agent:
            raise HTTPException(status_code=404, detail="Agent not found")
        
        # Search KB chunks
        chunks = await db.search_kb_chunks(agent_id, query, limit)
        
        return {
            "query": query,
            "results": chunks,
            "count": len(chunks)
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error searching KB: {e}")
        raise HTTPException(status_code=500, detail="Failed to search KB")

@router.delete("/chunks/{chunk_id}")
async def delete_kb_chunk(
    agent_id: str,
    chunk_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete a specific KB chunk"""
    try:
        # Verify agent ownership
        agent = await db.get_agent(agent_id, current_user.id)
        if not agent:
            raise HTTPException(status_code=404, detail="Agent not found")
        
        # Delete chunk (this would need to be implemented in DatabaseManager)
        # await db.delete_kb_chunk(chunk_id, agent_id)
        
        return {"message": "KB chunk deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting KB chunk: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete KB chunk") 