from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

from app.routes.upload import router as upload_router
from app.core.database import engine, Base
from app.models.db_models import Resume

import logging

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables verified/created successfully.")
except Exception as e:
    logger.error(f"Failed to create database tables: {e}")

app = FastAPI(title="AI Resume Analyzer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with your specific frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_router)

@app.get("/")
def home():
    return {"message": "ATS Analyzer API is running", "status": "healthy"}

@app.get("/health")
def health_check():
    return {"status": "ok", "timestamp": str(datetime.now()) if 'datetime' in globals() else "running"}