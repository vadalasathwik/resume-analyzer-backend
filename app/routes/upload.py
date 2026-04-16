import os
import shutil
import time
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Query
from fastapi.responses import FileResponse
from sqlalchemy import or_, desc
from app.core.database import SessionLocal
from app.models.db_models import Resume
from app.services.parser import extract_text_from_pdf
from app.services.analyzer import extract_skills, extract_experience
from app.services.scorer import calculate_score, keyword_match, find_missing

router = APIRouter()

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads/resumes")
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR, exist_ok=True)


# ----------------------------------------------------
# 1. RANK RESUMES + SAVE TO DATABASE
# ----------------------------------------------------
@router.post("/rank-resumes")
async def rank_resumes(
    files: list[UploadFile] = File(...),
    job_description: str = Form(None),
    jd_file: UploadFile = File(None)
):
    for file in files:
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(status_code=400, detail=f"'{file.filename}' is not a PDF.")

    jd_text = None
    if jd_file and jd_file.filename:
        try: jd_text = extract_text_from_pdf(jd_file)
        except: raise HTTPException(status_code=400, detail="Failed to parse JD PDF.")
    elif job_description and job_description.strip() and job_description.strip().lower() != "string":
        jd_text = job_description

    required_skills = extract_skills(jd_text) if jd_text else []
    results = []
    db = SessionLocal()

    try:
        for file in files:
            file.file.seek(0)
            try:
                text = extract_text_from_pdf(file)
            except:
                continue

            file.file.seek(0)
            timestamp = int(time.time() * 1000)
            safe_filename = f"{timestamp}_{file.filename.replace(' ', '_')}"
            file_path = os.path.join(UPLOAD_DIR, safe_filename)
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)

            skills = list(set(extract_skills(text)))
            experience = extract_experience(text)
            score = calculate_score(skills, required_skills)
            match = keyword_match(skills, required_skills)
            missing = find_missing(skills, required_skills)
            ats_score = int((score * 0.6) + (match * 0.4))

            db_resume = Resume(
                filename=file.filename,
                skills=", ".join(skills),
                experience=experience,
                score=score,
                ats_score=ats_score,
                file_path=file_path
            )
            db.add(db_resume)
            db.commit()
            db.refresh(db_resume)

            results.append({
                "id": db_resume.id,
                "filename": file.filename,
                "skills": skills,
                "experience": experience,
                "ats_score": ats_score,
                "missing_skills": missing,
                "has_preview": True
            })

        return {"ranked_candidates": sorted(results, key=lambda x: x["ats_score"], reverse=True)}
    finally:
        db.close()

# ----------------------------------------------------
# 2. GET CANDIDATES (WITH PREVIEW AVAILABILITY CHECK)
# ----------------------------------------------------
@router.get("/candidates")
def get_candidates(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1),
    search: str = Query(None),
    min_score: int = Query(None),
    experience_range: str = Query(None),
    skills: str = Query(None)
):
    db = SessionLocal()
    try:
        query = db.query(Resume)

        if search:
            query = query.filter(or_(Resume.filename.ilike(f"%{search}%"), Resume.skills.ilike(f"%{search}%")))
        if min_score is not None:
            query = query.filter(Resume.ats_score >= min_score)
        if skills:
            skill_list = [s.strip().lower() for s in skills.split(",") if s.strip()]
            for s in skill_list:
                query = query.filter(Resume.skills.ilike(f"%{s}%"))

        if experience_range and experience_range != "all":
            if experience_range == "0-1":
                query = query.filter(Resume.experience.op('~')('^[0-1](\.[0-9]+)?\s*year'))
            elif experience_range == "1-3":
                query = query.filter(Resume.experience.op('~')('^[1-3](\.[0-9]+)?\s*year'))
            elif experience_range == "3+":
                query = query.filter(Resume.experience.op('~')('^([3-9]|[1-9][0-9]+)(\.[0-9]+)?\s*year'))

        total = query.count()
        resumes = query.order_by(desc(Resume.id)).offset((page - 1) * limit).limit(limit).all()

        return {
            "candidates": [
                {
                    "id": r.id,
                    "filename": r.filename,
                    "skills": r.skills,
                    "experience": r.experience,
                    "ats_score": r.ats_score,
                    "has_preview": bool(r.file_path and os.path.exists(r.file_path))
                } for r in resumes
            ],
            "total": total,
            "page": page,
            "limit": limit
        }
    finally:
        db.close()

# ----------------------------------------------------
# 3. GET RESUME (IMPROVED ERROR REPORTING)
# ----------------------------------------------------
@router.get("/resume/{id}")
async def get_resume_file(id: int):
    db = SessionLocal()
    try:
        resume = db.query(Resume).filter(Resume.id == id).first()
        if not resume:
            raise HTTPException(status_code=404, detail="Candidate not found in database.")
        if not resume.file_path:
            raise HTTPException(status_code=404, detail="This is a legacy candidate. No physical file was saved for preview.")
        if not os.path.exists(resume.file_path):
            raise HTTPException(status_code=404, detail="File no longer exists on the server disk.")
            
        return FileResponse(resume.file_path, media_type="application/pdf", filename=resume.filename)
    finally:
        db.close()

@router.delete("/candidates/{id}")
def delete_candidate(id: int):
    db = SessionLocal()
    try:
        resume = db.query(Resume).filter(Resume.id == id).first()
        if not resume: raise HTTPException(status_code=404)
        if resume.file_path and os.path.exists(resume.file_path):
            try: os.remove(resume.file_path)
            except: pass
        db.delete(resume)
        db.commit()
        return {"message": "Deleted"}
    finally:
        db.close()