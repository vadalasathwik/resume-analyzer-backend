import re
from datetime import datetime

skills_db = [
    # Programming Languages
    "python", "java", "javascript", "typescript", "c++", "c#", "go", "rust",
    "ruby", "php", "swift", "kotlin", "scala", "r",
    # Frontend
    "react", "angular", "vue", "next.js", "nextjs", "html", "css", "tailwind",
    "sass", "svelte", "redux", "jquery",
    # Backend
    "node", "express", "fastapi", "django", "flask", "spring boot", "spring",
    "asp.net", "laravel", "rails",
    # Databases
    "sql", "postgresql", "mysql", "mongodb", "redis", "elasticsearch",
    "cassandra", "dynamodb", "sqlite", "oracle",
    # Cloud & DevOps
    "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "ansible",
    "ci/cd", "jenkins", "github actions", "gitlab", "linux",
    # AI/ML & Data
    "machine learning", "deep learning", "nlp", "tensorflow", "pytorch",
    "data science", "pandas", "numpy", "scikit-learn", "spark", "hadoop",
    "data analysis", "data engineering", "computer vision",
    # General / Architecture
    "api", "rest", "graphql", "microservices", "agile", "scrum", "git",
    "jira", "figma", "power bi", "tableau",
]

def extract_skills(text):
    text_lower = text.lower()
    found = []
    for skill in skills_db:
        # Use word boundary matching to avoid partial matches
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, text_lower):
            found.append(skill)
    return found


def extract_experience(text):
    text_lower = text.lower()

    # Pattern 1: "X+ years" or "X years" or "X yrs"
    matches = re.findall(r'(\d+)\+?\s*(?:years?|yrs?)\s*(?:of)?\s*(?:experience)?', text_lower)
    if matches:
        years = [int(m) for m in matches]
        return f"{max(years)} years"

    # Pattern 2: Date range like "Jan 2018 - Present" or "2018 - 2024"
    # Check for "present" / "current" to calculate from start year
    present_match = re.search(
        r'(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*(\d{4})\s*[-–—to]+\s*(present|current|now)',
        text_lower
    )
    if present_match:
        start_year = int(present_match.group(2))
        return f"{datetime.now().year - start_year} years"

    # Pattern 3: Year range "2018 - 2024"
    year_range = re.findall(r'(\d{4})\s*[-–—to]+\s*(\d{4})', text_lower)
    if year_range:
        spans = [int(end) - int(start) for start, end in year_range]
        total = sum(s for s in spans if 0 < s < 50)
        if total > 0:
            return f"{total} years"

    # Pattern 4: Earliest date mention
    date_matches = re.findall(
        r'(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+(\d{4})',
        text_lower
    )
    if date_matches:
        years = [int(m[1]) for m in date_matches if 1970 < int(m[1]) <= datetime.now().year]
        if years:
            earliest = min(years)
            return f"{datetime.now().year - earliest} years"

    return "Not found"