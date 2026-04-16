import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    # Fallback to help local development if .env is missing
    DATABASE_URL = "postgresql://user:pass@localhost/dbname"
    print("WARNING: DATABASE_URL not found, using local fallback.")

# Neon/Standard fix: replace postgres:// with postgresql:// for SQLAlchemy
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Ensure SSL for Neon
if "sslmode" not in DATABASE_URL:
    sep = "&" if "?" in DATABASE_URL else "?"
    DATABASE_URL += f"{sep}sslmode=require"

engine = create_engine(
    DATABASE_URL,
    pool_size=5,        # Neon free tier allows limited connections, so we keep this small
    max_overflow=10,
    pool_pre_ping=True
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()