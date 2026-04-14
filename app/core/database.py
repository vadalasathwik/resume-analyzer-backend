import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv("postgresql://resume_analyzer_db:hLBOQB5DaqaI4b4Ca9YlSwXXNWNpr4Hr@dpg-d7f3hv57vvec73chtnlg-a/resume_analyzer_db_siihL")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)