import os
import re
from typing import Dict, List
import docx2txt
from pdfminer.high_level import extract_text

class ResumeParser:
    """
    Parses PDF and DOCX files into text and segments them into logical sections.
    """
    
    SECTIONS = {
        "SKILLS": ["skills", "technical skills", "technologies", "core competencies"],
        "EXPERIENCE": ["experience", "work experience", "employment", "professional background"],
        "EDUCATION": ["education", "academic background", "qualifications"],
        "PROJECTS": ["projects", "personal projects", "academic projects"],
    }

    @staticmethod
    def extract_text(file_path: str) -> str:
        """Extracts raw text from PDF or DOCX."""
        ext = os.path.splitext(file_path)[1].lower()
        if ext == '.pdf':
            return extract_text(file_path)
        elif ext == '.docx':
            return docx2txt.process(file_path)
        else:
            raise ValueError(f"Unsupported file format: {ext}")

    @staticmethod
    def segment_resume(text: str) -> Dict[str, str]:
        """
        Heuristic-based segmentation of resume text.
        """
        lines = text.split('\n')
        segmented = {
            "SKILLS": "",
            "EXPERIENCE": "",
            "EDUCATION": "",
            "PROJECTS": "",
            "SUMMARY": ""  # Catch-all
        }
        
        current_section = "SUMMARY"
        
        for line in lines:
            clean_line = line.strip().lower()
            if not clean_line:
                continue
                
            # Check if line is a section header
            found_section = None
            for section, keywords in ResumeParser.SECTIONS.items():
                if any(keyword == clean_line or f"{keyword}:" == clean_line for keyword in keywords):
                    found_section = section
                    break
            
            if found_section:
                current_section = found_section
            else:
                segmented[current_section] += line + "\n"
        
        return segmented

    @staticmethod
    def clean_text(text: str) -> str:
        """Basic text cleaning."""
        text = re.sub(r'\s+', ' ', text)  # Remove extra whitespace
        text = re.sub(r'[^\w\s.,-]', '', text) # Remove special chars
        return text.strip()
