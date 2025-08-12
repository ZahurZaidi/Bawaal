from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
import logging

from .routes import agents, knowledge_base, chat
from .auth import get_current_user, User
from .database import DatabaseManager
from .embedding_service import EmbeddingService
from dotenv import load_dotenv
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="AI Chat Platform API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
from .database import DatabaseManager
from .embedding_service import EmbeddingService

@app.on_event("startup")
async def startup_event():
    logger.info("Initializing backend services...")
    
    # Test database connection
    try:
        db = DatabaseManager()
        logger.info("Database connection established")
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        raise
    
    # Test embedding service
    try:
        embedding_service = EmbeddingService()
        logger.info("Embedding service ready")
    except Exception as e:
        logger.error(f"Embedding service initialization failed: {e}")
        # This is not critical, continue
    
    logger.info("Backend services initialized")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Backend services shutdown")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "AI Chat Platform API"}

@app.get("/auth/test")
async def test_auth_get(current_user: User = Depends(get_current_user)):
    """Test endpoint to verify GET authentication"""
    return {
        "message": "GET Authentication successful",
        "user_id": current_user.id,
        "email": current_user.email
    }

@app.post("/auth/test")
async def test_auth_post(current_user: User = Depends(get_current_user)):
    """Test endpoint to verify POST authentication"""
    return {
        "message": "POST Authentication successful",
        "user_id": current_user.id,
        "email": current_user.email
    }

# Include routers
app.include_router(agents.router)
app.include_router(knowledge_base.router)
app.include_router(chat.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 