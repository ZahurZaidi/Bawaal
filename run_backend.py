#!/usr/bin/env python3
"""
Simple script to run the FastAPI backend server
"""

import uvicorn
import os
import sys

# Add backend directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

if __name__ == "__main__":
    uvicorn.run(
    "backend.main:app",
    host="0.0.0.0",
    port=8000,
    reload=True,
    log_level="info"
)