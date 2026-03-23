"""
Symptom-to-Medicine Mapping Database with Multi-Language Support

Maps symptoms to medicines with exact matching across English, Marathi, and Hindi.
"""

import re

# Comprehensive symptom-medicine mapping
# Keys are normalized symptoms in English
# Values contain medicines and their translations
SYMPTOM_MEDICINE_MAP = {
    "headache": {
        "en": {"symptom": "Headache", "medicines": ["Paracetamol apodiscounter 500 mg", "Nurofen 200 mg"]},
        "mr": {"symptom": "सरदर्द", "medicines": ["Paracetamol apodiscounter 500 mg", "Nurofen 200 mg"]},
        "hi": {"symptom": "सिरदर्द", "medicines": ["Paracetamol apodiscounter 500 mg", "Nurofen 200 mg"]},
    },
    "stomach pain": {
        "en": {"symptom": "Stomach Pain", "medicines": ["Iberogast Classic", "Kijimea Reizdarm PRO", "Paracetamol apodiscounter 500 mg"]},
        "mr": {"symptom": "पोटदर्द", "medicines": ["Iberogast Classic", "Kijimea Reizdarm PRO", "Paracetamol apodiscounter 500 mg"]},
        "hi": {"symptom": "पेट दर्द", "medicines": ["Iberogast Classic", "Kijimea Reizdarm PRO", "Paracetamol apodiscounter 500 mg"]},
    },
    "heartburn": {
        "en": {"symptom": "Heartburn", "medicines": ["Paracetamol apodiscounter 500 mg", "Kijimea Reizdarm PRO"]},
        "mr": {"symptom": "हृदयदाहीता", "medicines": ["Paracetamol apodiscounter 500 mg", "Kijimea Reizdarm PRO"]},
        "hi": {"symptom": "सीने में जलन", "medicines": ["Paracetamol apodiscounter 500 mg", "Kijimea Reizdarm PRO"]},
    },
    "bloating": {
        "en": {"symptom": "Bloating", "medicines": ["Kijimea Reizdarm PRO", "Iberogast Classic"]},
        "mr": {"symptom": "फुगवलेपन", "medicines": ["Kijimea Reizdarm PRO", "Iberogast Classic"]},
        "hi": {"symptom": "सूजन", "medicines": ["Kijimea Reizdarm PRO", "Iberogast Classic"]},
    },
    "nausea": {
        "en": {"symptom": "Nausea", "medicines": ["Paracetamol apodiscounter 500 mg", "Kijimea Reizdarm PRO"]},
        "mr": {"symptom": "मळमळ", "medicines": ["Paracetamol apodiscounter 500 mg", "Kijimea Reizdarm PRO"]},
        "hi": {"symptom": "जी मचलाना", "medicines": ["Paracetamol apodiscounter 500 mg", "Kijimea Reizdarm PRO"]},
    },
    "muscle pain": {
        "en": {"symptom": "Muscle Pain", "medicines": ["Diclo-ratiopharm Schmerzgel", "Paracetamol apodiscounter 500 mg"]},
        "mr": {"symptom": "मांसपेशीदर्द", "medicines": ["Diclo-ratiopharm Schmerzgel", "Paracetamol apodiscounter 500 mg"]},
        "hi": {"symptom": "मांसपेशी दर्द", "medicines": ["Diclo-ratiopharm Schmerzgel", "Paracetamol apodiscounter 500 mg"]},
    },
    "joint pain": {
        "en": {"symptom": "Joint Pain", "medicines": ["Diclo-ratiopharm Schmerzgel", "Paracetamol apodiscounter 500 mg"]},
        "mr": {"symptom": "संधि दर्द", "medicines": ["Diclo-ratiopharm Schmerzgel", "Paracetamol apodiscounter 500 mg"]},
        "hi": {"symptom": "जोड़ों में दर्द", "medicines": ["Diclo-ratiopharm Schmerzgel", "Paracetamol apodiscounter 500 mg"]},
    },
    "chest pain": {
        "en": {"symptom": "Chest Pain", "medicines": []},  # Not available - medical attention required
        "mr": {"symptom": "छातीदर्द", "medicines": []},
        "hi": {"symptom": "सीने में दर्द", "medicines": []},
    },
    "heart pain": {
        "en": {"symptom": "Heart Pain", "medicines": []},  # Not available - medical attention required
        "mr": {"symptom": "हृदयरोग", "medicines": []},
        "hi": {"symptom": "दिल में दर्द", "medicines": []},
    },
    "fever": {
        "en": {"symptom": "Fever", "medicines": ["Paracetamol apodiscounter 500 mg"]},
        "mr": {"symptom": "ताप", "medicines": ["Paracetamol apodiscounter 500 mg"]},
        "hi": {"symptom": "बुखार", "medicines": ["Paracetamol apodiscounter 500 mg"]},
    },
    "cough": {
        "en": {"symptom": "Cough", "medicines": []},  # Add cough medicines to inventory if available
        "mr": {"symptom": "खोकला", "medicines": []},
        "hi": {"symptom": "खांसी", "medicines": []},
    },
    "cold": {
        "en": {"symptom": "Cold", "medicines": []},  # Add cold medicines to inventory if available
        "mr": {"symptom": "सर्दी", "medicines": []},
        "hi": {"symptom": "ज़ुकाम", "medicines": []},
    },
    "sinus": {
        "en": {"symptom": "Sinus Congestion", "medicines": ["Sinupret® Saft"]},
        "mr": {"symptom": "Sinus Congestion", "medicines": ["Sinupret® Saft"]},
        "hi": {"symptom": "Sinus Congestion", "medicines": ["Sinupret® Saft"]},
    },
    "blocked nose": {
        "en": {"symptom": "Blocked Nose", "medicines": ["Sinupret® Saft"]},
        "mr": {"symptom": "Blocked Nose", "medicines": ["Sinupret® Saft"]},
        "hi": {"symptom": "Blocked Nose", "medicines": ["Sinupret® Saft"]},
    },
    "itchy eyes": {
        "en": {"symptom": "Itchy Eyes", "medicines": ["Vividrin® iso EDO® antiallergische Augentropfen", "Livocab® direkt Augentropfen, 0,05 % Augentropfen, Suspension"]},
        "mr": {"symptom": "Itchy Eyes", "medicines": ["Vividrin® iso EDO® antiallergische Augentropfen", "Livocab® direkt Augentropfen, 0,05 % Augentropfen, Suspension"]},
        "hi": {"symptom": "Itchy Eyes", "medicines": ["Vividrin® iso EDO® antiallergische Augentropfen", "Livocab® direkt Augentropfen, 0,05 % Augentropfen, Suspension"]},
    },
    "red eyes": {
        "en": {"symptom": "Red Eyes", "medicines": ["Vividrin® iso EDO® antiallergische Augentropfen", "Cromo-ratiopharm® Augentropfen Einzeldosis"]},
        "mr": {"symptom": "Red Eyes", "medicines": ["Vividrin® iso EDO® antiallergische Augentropfen", "Cromo-ratiopharm® Augentropfen Einzeldosis"]},
        "hi": {"symptom": "Red Eyes", "medicines": ["Vividrin® iso EDO® antiallergische Augentropfen", "Cromo-ratiopharm® Augentropfen Einzeldosis"]},
    },
    "constipation": {
        "en": {"symptom": "Constipation", "medicines": ["DulcoLax® Dragées, 5 mg magensaftresistente Tabletten"]},
        "mr": {"symptom": "Constipation", "medicines": ["DulcoLax® Dragées, 5 mg magensaftresistente Tabletten"]},
        "hi": {"symptom": "Constipation", "medicines": ["DulcoLax® Dragées, 5 mg magensaftresistente Tabletten"]},
    },
    "diarrhea": {
        "en": {"symptom": "Diarrhea", "medicines": ["Loperamid akut - 1 A Pharma®, 2 mg Hartkapseln"]},
        "mr": {"symptom": "Diarrhea", "medicines": ["Loperamid akut - 1 A Pharma®, 2 mg Hartkapseln"]},
        "hi": {"symptom": "Diarrhea", "medicines": ["Loperamid akut - 1 A Pharma®, 2 mg Hartkapseln"]},
    },
    "fatigue": {
        "en": {"symptom": "Fatigue", "medicines": ["NORSAN Omega-3 Total"]},
        "mr": {"symptom": "थकवा", "medicines": ["NORSAN Omega-3 Total"]},
        "hi": {"symptom": "थकान", "medicines": ["NORSAN Omega-3 Total"]},
    },
    "exhaustion": {
        "en": {"symptom": "Exhaustion", "medicines": ["NORSAN Omega-3 Total"]},
        "mr": {"symptom": "संपूर्ण थकवा", "medicines": ["NORSAN Omega-3 Total"]},
        "hi": {"symptom": "पूर्ण थकान", "medicines": ["NORSAN Omega-3 Total"]},
    },
}

# Word variations to normalize symptom detection
SYMPTOM_ALIASES = {
    # English variations
    "head pain": "headache",
    "head ache": "headache",
    "migraine": "headache",
    "belly pain": "stomach pain",
    "abdominal pain": "stomach pain",
    "gastric issue": "stomach pain",
    "indigestion": "stomach pain",
    "intestinal pain": "stomach pain",
    "burning chest": "heartburn",
    "acid reflux": "heartburn",
    "gird pain": "chest pain",
    "heart ache": "heart pain",
    "cardiac pain": "heart pain",
    "swelling": "bloating",
    "gas": "bloating",
    "back pain": "muscle pain",
    "neck pain": "muscle pain",
    "body ache": "muscle pain",
    "body pain": "muscle pain",
    "leg pain": "muscle pain",
    "pain in leg": "muscle pain",
    "pain in my leg": "muscle pain",
    "pain in the leg": "muscle pain",
    "legs hurt": "muscle pain",
    "leg ache": "muscle pain",
    "sore legs": "muscle pain",
    "thigh pain": "muscle pain",
    "calf pain": "muscle pain",
    "leg strain": "muscle pain",
    "leg sprain": "joint pain",
    "ankle pain": "joint pain",
    "knee pain": "joint pain",
    "shoulder pain": "joint pain",
    "arthritis": "joint pain",
    "rheumatism": "joint pain",
    "high temperature": "fever",
    "sinus congestion": "sinus",
    "sinus problem": "sinus",
    "sinus pressure": "sinus",
    "stuffy nose": "blocked nose",
    "blocked nostril": "blocked nose",
    "nose blocked": "blocked nose",
    "nasal congestion": "blocked nose",
    "cold and cough": "cough",
    "itchy eye": "itchy eyes",
    "eye itching": "itchy eyes",
    "itchy red eyes": "itchy eyes",
    "red eye": "red eyes",
    "eye redness": "red eyes",
    "allergic eyes": "itchy eyes",
    "loose motion": "diarrhea",
    "loose motions": "diarrhea",
    "motions": "diarrhea",
    "hard stool": "constipation",
    "cannot pass stool": "constipation",
    "tiredness": "fatigue",
    "weak": "fatigue",
    "energy loss": "fatigue",
    
    # Marathi variations
    "डोकेदर्द": "headache",
    "मूड": "headache",
    "पोट दुखतो": "stomach pain",
    "पोट दुखतय": "stomach pain",
    "ओटीपोटीदर्द": "stomach pain",
    "छाती जळत": "heartburn",
    "हृदय दुखतय": "heart pain",
    "फुग": "bloating",
    "वायु": "bloating",
    "मळमळ येत": "nausea",
    "मांसपेशी दुखतय": "muscle pain",
    "हाड दुखतय": "joint pain",
    "तापमान": "fever",
    "खोकल्याचा": "cough",
    "सर्दीचा": "cold",
    "थकलो": "fatigue",
    "कमजोर": "exhaustion",
    
    # Hindi variations
    "सिर दर्द": "headache",
    "सिरदार्द": "headache",
    "माइग्रेन": "headache",
    "पेट दर्द": "stomach pain",
    "पेट दुखना": "stomach pain",
    "पेट खराब": "stomach pain",
    "एसिडिटी": "heartburn",
    "सीने में जलन": "heartburn",
    "दिल का दर्द": "heart pain",
    "हृदय दर्द": "heart pain",
    "सूजन": "bloating",
    "गैस": "bloating",
    "जी मचलना": "nausea",
    "मांसपेशी दर्द": "muscle pain",
    "जोड़": "joint pain",
    "गठिया": "joint pain",
    "बुखार": "fever",
    "ताप": "fever",
    "खांसी": "cough",
    "जुकाम": "cold",
    "ज़ुकाम": "cold",
    "थकान": "fatigue",
    "कमजोरी": "exhaustion",
    "बेचैनी": "exhaustion",
}

from datetime import datetime

SYMPTOM_GUIDANCE = {
    "headache": {
        "best_option_contains": "nurofen 200 mg",
        "summary": {
            "en": "This medicine is commonly used for headache and migraine relief.",
        },
        "best_reason": {
            "en": "It contains ibuprofen and is one of the most suitable options from your list for headache pain relief.",
        },
        "use": {
            "en": [
                "Take after food.",
                "Use the usual dose only as directed on the pack or by your doctor.",
            ],
        },
        "helps_with": {
            "en": ["Headache", "Migraine", "Body pain"],
        },
        "tablet_intro": {
            "en": "One related alternative from your list:",
        },
    },
    "muscle pain": {
        "best_option_contains": "diclo ratiopharm schmerzgel",
        "summary": {
            "en": "This looks most similar to muscle or soft-tissue leg pain.",
        },
        "best_reason": {
            "en": "Best for local leg pain because it works directly on the painful area and may help with pain, strain, and swelling.",
        },
        "use": {
            "en": [
                "Apply a thin layer on the painful area 2-3 times daily.",
                "Massage gently unless the area is very tender.",
                "Do not apply on broken skin.",
            ],
        },
        "helps_with": {
            "en": ["Muscle pain", "Sprain or strain", "Mild swelling", "Joint discomfort around the leg"],
        },
        "tablet_intro": {
            "en": "If pain feels stronger, you can consider these tablets from your list:",
        },
    },
    "joint pain": {
        "best_option_contains": "diclo ratiopharm schmerzgel",
        "summary": {
            "en": "This sounds closer to a joint-related pain problem.",
        },
        "best_reason": {
            "en": "A topical anti-inflammatory gel is often the most targeted first option for mild joint pain in the leg area.",
        },
        "use": {
            "en": [
                "Apply on the affected joint area 2-3 times daily.",
                "Massage gently around the joint.",
                "Avoid use on cuts or irritated skin.",
            ],
        },
        "helps_with": {
            "en": ["Joint pain", "Movement-related pain", "Mild inflammation"],
        },
        "tablet_intro": {
            "en": "If pain is stronger, these tablets may help:",
        },
    },
}

DEFAULT_SAFETY_LINES = [
    "Seek medical care urgently if the leg is very swollen, red, hot, numb, injured after a fall, or you cannot walk properly.",
    "If pain lasts more than a few days or keeps getting worse, consult a doctor.",
]

GENERIC_GUIDANCE = {
    "summary": {
        "en": "These are the closest available matches from your current medicine list.",
    },
    "best_reason": {
        "en": "This option appears most relevant based on your symptom description and the medicines available in stock.",
    },
    "use": {
        "en": [],
    },
    "helps_with": {
        "en": [],
    },
    "tablet_intro": {
        "en": "Other available options from your list:",
    },
    "best_option_contains": "",
}

class SymptomMapper:
    """Service to map symptoms to medicines with exact matching"""
    
    def __init__(self):
        pass
    
    @staticmethod
    def normalize_symptom(symptom: str) -> str:
        """Normalize symptom to lowercase without punctuation"""
        if not symptom:
            return ""
        normalized = symptom.lower().strip()
        normalized = re.sub(r"[^\w\s]", " ", normalized, flags=re.UNICODE)
        normalized = normalized.replace("_", " ")
        normalized = re.sub(r"\b(i|im|i'm|have|having|feel|feeling|got|my|in|the|a|an)\b", " ", normalized)
        normalized = re.sub(r"\s+", " ", normalized).strip()
        return normalized
    
    @classmethod
    def find_matching_medicines(cls, symptom: str, language: str = "en") -> dict:
        """
        Find medicines that match the exact symptom.
        
        Args:
            symptom: User's symptom description
            language: 'en', 'mr', or 'hi'
        
        Returns:
            {
                'found': bool,
                'symptom': str (translated),
                'medicines': [list of medicine names],
                'language': str,
                'message': str (if not found)
            }
        """
        normalized_symptom = cls.normalize_symptom(symptom)
        
        # First try direct match with English keys
        symptom_key = None
        for key in SYMPTOM_MEDICINE_MAP.keys():
            if cls.normalize_symptom(key) == normalized_symptom:
                symptom_key = key
                break
        
        # Try aliases if no direct match
        if not symptom_key:
            for alias, base_symptom in SYMPTOM_ALIASES.items():
                normalized_alias = cls.normalize_symptom(alias)
                if normalized_alias == normalized_symptom:
                    symptom_key = base_symptom
                    break
                if normalized_alias and (normalized_alias in normalized_symptom or normalized_symptom in normalized_alias):
                    symptom_key = base_symptom
                    break
        
        # Try translation lookup - check if input matches any language translation
        if not symptom_key:
            for key, translation_dict in SYMPTOM_MEDICINE_MAP.items():
                for lang_code, lang_data in translation_dict.items():
                    if lang_code != 'en':  # Check non-English translations
                        translated_symptom = lang_data.get('symptom', '')
                        if cls.normalize_symptom(translated_symptom) == normalized_symptom:
                            symptom_key = key
                            break
                if symptom_key:
                    break
        
        # If still no match, try partial matching
        if not symptom_key:
            for key in SYMPTOM_MEDICINE_MAP.keys():
                if normalized_symptom in key or key in normalized_symptom:
                    symptom_key = key
                    break
        
        # No match found
        if not symptom_key:
            return {
                'found': False,
                'symptom': symptom,
                'medicines': [],
                'language': language,
                'message': f"I could not find medicines for '{symptom}'. Please consult a doctor."
            }
        
        # Get mapping data
        mapping = SYMPTOM_MEDICINE_MAP.get(symptom_key, {})
        language_data = mapping.get(language, mapping.get('en', {}))
        
        medicines = language_data.get('medicines', [])
        symptom_translated = language_data.get('symptom', symptom)
        
        # Check if medicines are available
        if not medicines:
            return {
                'found': True,
                'symptom': symptom_translated,
                'medicines': [],
                'language': language,
                'message': f"No medicines are currently available to treat '{symptom_translated}'. Please consult a doctor.",
                'not_available': True
            }
        
        return {
            'found': True,
            'symptom': symptom_translated,
            'medicines': medicines,
            'language': language,
            'message': None
        }

    @classmethod
    def build_recommendation_response(cls, symptom_result: dict, original_query: str = "", language: str = "en") -> str:
        """Build a stable, user-friendly symptom recommendation response."""
        medicines = symptom_result.get("medicines", []) or []
        symptom_name = symptom_result.get("symptom") or original_query or "your symptoms"

        if not medicines:
            return symptom_result.get("message") or f"I could not find medicines for '{symptom_name}'. Please consult a doctor."

        normalized_symptom = cls.normalize_symptom(original_query or symptom_name)
        matched_key = None

        for key in SYMPTOM_MEDICINE_MAP:
            normalized_key = cls.normalize_symptom(key)
            if normalized_key == normalized_symptom or normalized_key in normalized_symptom or normalized_symptom in normalized_key:
                matched_key = key
                break

        if not matched_key:
            for alias, base_symptom in SYMPTOM_ALIASES.items():
                normalized_alias = cls.normalize_symptom(alias)
                if normalized_alias == normalized_symptom or normalized_alias in normalized_symptom or normalized_symptom in normalized_alias:
                    matched_key = base_symptom
                    break

        guide = SYMPTOM_GUIDANCE.get(matched_key or "", GENERIC_GUIDANCE)
        best_hint = guide.get("best_option_contains", "")
        ai_selection = symptom_result.get("ai_selection") or {}

        def normalized_name(item):
            return cls.normalize_symptom(item.get("name", ""))

        best = next((item for item in medicines if best_hint and best_hint in normalized_name(item)), medicines[0])
        alternatives = [item for item in medicines if item is not best and item.get("in_catalog_mapping")]
        alternatives = alternatives[:1]
        best_reason = ai_selection.get("best_reason") or guide.get("best_reason", {}).get(
            "en",
            "This option looks most suitable from the medicines currently available in your list.",
        )

        response_lines = [
            f"**Medicine that works best for {symptom_name}**",
            "",
            f"**{best.get('name', 'Recommended medicine')}**",
            "",
            guide.get("summary", {}).get("en", "This is one of the closest available matches for your symptoms."),
            "",
            "**Why I recommend this**",
            f"- {best_reason}",
        ]

        if best.get("price") not in (None, ""):
            response_lines.append(f"- Price: ${best.get('price')}")
        if isinstance(best.get("stock"), int):
            response_lines.append(f"- In stock: {best.get('stock')}")

        helps_with = guide.get("helps_with", {}).get("en", [])
        if helps_with:
            response_lines.extend(["", "**Helpful for**"])
            response_lines.extend([f"- {item}" for item in helps_with])

        use_steps = guide.get("use", {}).get("en", [])
        if use_steps:
            response_lines.extend(["", "**How to use**"])
            response_lines.extend([f"- {step}" for step in use_steps])

        if alternatives:
            response_lines.extend(["", "**One related alternative**"])
            for item in alternatives:
                line = f"- **{item.get('name', 'Medicine')}**"
                if item.get("price") not in (None, ""):
                    line += f" (${item.get('price')})"
                if ai_selection.get("related_reason"):
                    line += f" - {ai_selection.get('related_reason')}"
                response_lines.append(line)

            tablet_intro = guide.get("tablet_intro", {}).get("en")
            if tablet_intro:
                response_lines.extend(["", tablet_intro])
        else:
            response_lines.extend(["", "**Related option**", "- No close second option from your current in-stock list."])

        response_lines.extend(["", "If you want, I can help you order this medicine."])

        return "\n".join(response_lines)
