from typing import List
import re
from backend.config import Config

class FairnessAnalyzer:
    """
    Simple checks for potential bias in text or metadata.
    """
    
    @staticmethod
    def check_bias(text: str) -> dict:
        """
        Scans text for sensitive words to flag potential implicit bias sources 
        if the model were to over-index on them.
        """
        found_terms = []
        text_lower = text.lower()
        
        for term in Config.SENSITIVE_TERMS:
            # Simple whole word match
            if re.search(r'\b' + re.escape(term) + r'\b', text_lower):
                found_terms.append(term)
                
        is_biased = len(found_terms) > 3 # Threshold
        
        return {
            "has_sensitive_terms": len(found_terms) > 0,
            "terms_found": found_terms,
            "fairness_flag": "Review Required" if is_biased else "Pass"
        }
