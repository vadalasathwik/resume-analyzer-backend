from sqlalchemy import create_engine, text

DATABASE_URL = "postgresql://postgres:sathwik%402025@localhost:5432/resume_analyzer_db"
engine = create_engine(DATABASE_URL)

def migrate():
    with engine.connect() as conn:
        print("Checking for file_path column in resumes table...")
        result = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='resumes' AND column_name='file_path'"))
        column_exists = result.fetchone()
        
        if not column_exists:
            print("file_path column missing. Adding it now...")
            conn.execute(text("ALTER TABLE resumes ADD COLUMN file_path VARCHAR"))
            conn.commit()
            print("Column added successfully!")
        else:
            print("file_path column already exists.")

if __name__ == "__main__":
    migrate()
