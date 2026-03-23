"""
Language Detection Service

Detects the language of user input (English, Marathi, Hindi)
and returns language code for response translation.
"""

import re
from typing import Tuple

class LanguageDetector:
    """Detects language from user input"""
    
    # Marathi character ranges (Devanagari script)
    MARATHI_PATTERN = re.compile(r'[\u0900-\u097F]')
    
    # Hindi character ranges (same Devanagari script)
    HINDI_PATTERN = re.compile(r'[\u0900-\u097F]')
    
    # Common English words (as fallback)
    ENGLISH_INDICATORS = {
        'order', 'medicine', 'product', 'symptom', 'pain', 'drug', 'price',
        'headache', 'fever', 'cold', 'cough', 'hello', 'hi', 'how', 'help',
        'paracetamol', 'ibuprofen', 'aspirin', 'thank', 'thanks'
    }
    
    # Common Marathi words
    MARATHI_INDICATORS = {
        'मी', 'आप', 'तुम्ही', 'आमचा', 'वेदना', 'दवा', 'औषध', 'दुखतो',
        'असते', 'कोण', 'काय', 'कसे', 'केव्हा', 'कुठे', 'वर', 'आहे',
        'घेऊ', 'हवेय', 'देऊ', 'दे', 'करा', 'केला', 'अन्', 'किंवा'
    }
    
    # Common Hindi words
    HINDI_INDICATORS = {
        'मैं', 'तुम', 'आप', 'क्या', 'कैसे', 'कब', 'कहां', 'क्या',
        'दर्द', 'दवा', 'बुखार', 'सरदर्द', 'है', 'हो', 'हैं', 'करो',
        'दे', 'दीजिए', 'चाहता', 'चाहती', 'चाहते', 'और', 'या'
    }
    
    @classmethod
    def detect_language(cls, text: str) -> Tuple[str, float]:
        """
        Detect language from text.
        
        Args:
            text: Input text from user
        
        Returns:
            Tuple of (language_code, confidence)
            language_code: 'en', 'mr', 'hi'
            confidence: 0.0 to 1.0
        """
        if not text or not isinstance(text, str):
            return 'en', 0.5
        
        text_lower = text.lower()
        
        # Check for Devanagari script (used by both Marathi and Hindi)
        devanagari_chars = cls.MARATHI_PATTERN.findall(text)
        
        if devanagari_chars:
            # Devanagari script detected - distinguish between Marathi and Hindi
            # by checking word indicators
            marathi_score = 0
            hindi_score = 0
            
            # Count word matches
            for word in cls.MARATHI_INDICATORS:
                if word in text:
                    marathi_score += 1
            
            for word in cls.HINDI_INDICATORS:
                if word in text:
                    hindi_score += 1
            
            # Give preference to Marathi for certain common endings/patterns
            # Marathi often ends with आहे, आहित, etc.
            if 'आहे' in text or 'आहित' in text or 'ल' in text[-3:]:
                marathi_score += 2
            
            # If marathi_score > hindi_score, choose Marathi
            # If scores are equal or marathi is lower, default to Hindi
            if marathi_score > hindi_score:
                # Add a base score + proportional to match count
                confidence = min(1.0, 0.65 + (marathi_score * 0.08))
                return 'mr', confidence
            else:
                confidence = min(1.0, 0.65 + (hindi_score * 0.08))
                return 'hi', confidence
        
        # No Devanagari - default to English
        # Check for English word indicators for confidence
        english_words = sum(1 for word in cls.ENGLISH_INDICATORS if word in text_lower)
        confidence = min(1.0, 0.5 + (english_words * 0.1))
        
        return 'en', confidence
    
    @classmethod
    def get_available_languages(cls) -> list:
        """Get list of supported languages"""
        return ['en', 'mr', 'hi']
    
    @classmethod
    def is_supported_language(cls, lang_code: str) -> bool:
        """Check if language is supported"""
        return lang_code in cls.get_available_languages()
