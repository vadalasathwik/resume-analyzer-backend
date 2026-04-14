from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.core.database import Base

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String)
    skills = Column(String)
    experience = Column(String)
    score = Column(Integer)
    ats_score = Column(Integer)
    file_path = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)