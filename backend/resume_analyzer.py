import fitz  # PyMuPDF
import numpy as np
import re
from sklearn.metrics.pairwise import cosine_similarity
from keywords_roles import keywords_roles

def analyze_resume(pdf_content):
    text = extract_text_from_pdf(pdf_content)
    matched_keywords = find_matching_keywords(text)
    role_percentages = calculate_role_percentages(matched_keywords)
    
    best_role = max(role_percentages, key=lambda x: x[1])
    
    return {
        "matched_keywords": organize_matched_keywords(matched_keywords),
        "role_percentages": role_percentages,
        "best_role": best_role
    }

def extract_text_from_pdf(pdf_content):
    text = ""
    doc = fitz.open(stream=pdf_content, filetype="pdf")
    for page in doc:
        text += page.get_text()
    return text.lower()

def find_matching_keywords(text):
    matched = {}
    for role, keywords in keywords_roles.items():
        for keyword in keywords:
            if re.search(r'\b' + re.escape(keyword) + r'\b', text):
                matched.setdefault(role, []).append(keyword)
    return matched

def calculate_role_percentages(matched_keywords):
    role_percentages = []
    for role, keywords in matched_keywords.items():
        total_keywords = len(keywords_roles.get(role, []))
        matched_count = len(keywords)
        if total_keywords > 0:
            percentage = (matched_count / total_keywords) * 100
            role_percentages.append([role, percentage])
    role_percentages.sort(key=lambda x: x[1], reverse=True)
    return role_percentages

def organize_matched_keywords(matched_keywords):
    return {role: keywords for role, keywords in matched_keywords.items()}
