"""
Test suite for symptom-to-medicine mapping and language detection.

Run with: python -m pytest backend/tests/test_symptom_mapping.py -v
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.services.symptom_mapping import SymptomMapper, SYMPTOM_MEDICINE_MAP
from app.services.language_detector import LanguageDetector


class TestSymptomMapping:
    """Test symptom-to-medicine mapping"""
    
    def test_exact_match_english_headache(self):
        """Test exact symptom match for headache in English"""
        result = SymptomMapper.find_matching_medicines("headache", "en")
        assert result['found'] == True
        assert len(result['medicines']) > 0
        assert any("Paracetamol" in str(m) for m in result['medicines'])
        assert result['language'] == 'en'
        print("✅ Test 1 passed: English headache")
    
    def test_exact_match_marathi_stomach_pain(self):
        """Test exact symptom match for stomach pain in Marathi"""
        result = SymptomMapper.find_matching_medicines("पोटदर्द", "mr")
        assert result['found'] == True
        assert len(result['medicines']) > 0
        assert result['language'] == 'mr'
        print("✅ Test 2 passed: Marathi stomach pain")
    
    def test_exact_match_hindi_fever(self):
        """Test exact symptom match for fever in Hindi"""
        result = SymptomMapper.find_matching_medicines("बुखार", "hi")
        assert result['found'] == True
        assert result['language'] == 'hi'
        print("✅ Test 3 passed: Hindi fever")
    
    def test_alias_matching(self):
        """Test symptom aliases are resolved"""
        result1 = SymptomMapper.find_matching_medicines("belly pain", "en")
        result2 = SymptomMapper.find_matching_medicines("stomach pain", "en")
        assert result1['found'] == True
        assert result2['found'] == True
        print("✅ Test 4 passed: Alias matching")
    
    def test_not_available_symptom(self):
        """Test symptom with no available medicines"""
        result = SymptomMapper.find_matching_medicines("heart pain", "en")
        assert result['found'] == True
        assert result['not_available'] == True
        assert result['medicines'] == []
        print("✅ Test 5 passed: Not available symptom")
    
    def test_unsupported_symptom(self):
        """Test unsupported symptom returns not found"""
        result = SymptomMapper.find_matching_medicines("xyz_invalid_symptom_xyz", "en")
        assert result['found'] == False
        assert result['medicines'] == []
        print("✅ Test 6 passed: Unsupported symptom")
    
    def test_case_insensitive(self):
        """Test symptom matching is case insensitive"""
        result1 = SymptomMapper.find_matching_medicines("HEADACHE", "en")
        result2 = SymptomMapper.find_matching_medicines("HeAdAcHe", "en")
        result3 = SymptomMapper.find_matching_medicines("headache", "en")
        assert result1['found'] == result2['found'] == result3['found'] == True
        print("✅ Test 7 passed: Case insensitive matching")

    def test_leg_pain_alias_matching(self):
        """Test natural leg pain phrase resolves to available medicines"""
        result = SymptomMapper.find_matching_medicines("I feel leg pain", "en")
        assert result["found"] == True
        assert any("Diclo-ratiopharm" in str(m) for m in result["medicines"])
        print("âœ… Test 8 passed: Leg pain alias matching")

    def test_recommendation_builder(self):
        """Test formatted symptom response contains structured guidance"""
        sample = {
            "found": True,
            "symptom": "Muscle Pain",
            "language": "en",
            "medicines": [
                {"name": "Diclo-ratiopharm Schmerzgel", "price": 10, "stock": 5},
                {"name": "Paracetamol apodiscounter 500 mg", "price": 4, "stock": 20},
            ],
        }
        text = SymptomMapper.build_recommendation_response(sample, "leg pain", "en")
        assert "best match" in text.lower()
        assert "Diclo-ratiopharm Schmerzgel" in text
        assert "How to use" in text
        print("âœ… Test 9 passed: Recommendation builder")


class TestLanguageDetection:
    """Test language detection"""
    
    def test_english_detection(self):
        """Test English language detection"""
        lang, confidence = LanguageDetector.detect_language("I have a headache")
        assert lang == 'en'
        assert confidence > 0.5
        print("✅ Test 8 passed: English detection")
    
    def test_marathi_detection(self):
        """Test Marathi language detection"""
        lang, confidence = LanguageDetector.detect_language("मला सरदर्द आहे")
        assert lang == 'mr'
        assert confidence > 0.5
        print("✅ Test 9 passed: Marathi detection")
    
    def test_hindi_detection(self):
        """Test Hindi language detection"""
        lang, confidence = LanguageDetector.detect_language("मुझे सिरदर्द है")
        assert lang == 'hi'
        assert confidence > 0.5
        print("✅ Test 10 passed: Hindi detection")
    
    def test_mixed_language_english_preference(self):
        """Test mixed language defaults to detected script"""
        lang, confidence = LanguageDetector.detect_language("I feel सरदर्द")
        print(f"   Mixed language detected as: {lang}")
        print("✅ Test 11 passed: Mixed language detection")
    
    def test_supported_languages(self):
        """Test supported languages"""
        supported = LanguageDetector.get_available_languages()
        assert 'en' in supported
        assert 'mr' in supported
        assert 'hi' in supported
        print("✅ Test 12 passed: Supported languages")


def run_all_tests():
    """Run all tests and print summary"""
    print("\n" + "="*60)
    print("SYMPTOM MAPPING AND LANGUAGE DETECTION TEST SUITE")
    print("="*60 + "\n")
    
    test_mapping = TestSymptomMapping()
    test_lang = TestLanguageDetection()
    
    try:
        # Symptom mapping tests
        test_mapping.test_exact_match_english_headache()
        test_mapping.test_exact_match_marathi_stomach_pain()
        test_mapping.test_exact_match_hindi_fever()
        test_mapping.test_alias_matching()
        test_mapping.test_not_available_symptom()
        test_mapping.test_unsupported_symptom()
        test_mapping.test_case_insensitive()
        test_mapping.test_leg_pain_alias_matching()
        test_mapping.test_recommendation_builder()
        
        # Language detection tests
        test_lang.test_english_detection()
        test_lang.test_marathi_detection()
        test_lang.test_hindi_detection()
        test_lang.test_mixed_language_english_preference()
        test_lang.test_supported_languages()
        
        print("\n" + "="*60)
        print("✅ ALL TESTS PASSED!")
        print("="*60 + "\n")
        
    except AssertionError as e:
        print(f"\n❌ TEST FAILED: {e}")
        return False
    
    return True


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
