def calculate_score(candidate_skills, required_skills=None):
    """
    Calculate a dynamic score based on how many required skills the candidate has.
    If no required skills provided, use a base scoring system.
    """
    if required_skills and len(required_skills) > 0:
        matched = len([s for s in candidate_skills if s in required_skills])
        return min(int((matched / len(required_skills)) * 100), 100)
    
    # Fallback: score based on total skill count
    base = min(len(candidate_skills) * 12, 100)
    return base


def keyword_match(skills, required):
    if not required:
        return 0

    matched = len([s for s in skills if s in required])
    return int((matched / len(required)) * 100)


def find_missing(skills, required):
    return [s for s in required if s not in skills]