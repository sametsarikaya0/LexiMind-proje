"""
LexiMind — Turkish NLP Preprocessor (app/nlp/preprocessor.py)
Handles Turkish character casing, academic stop-words, citation cleaning,
and robust tokenization.
"""

import re
from typing import List, Set

def turkish_lower(text: str) -> str:
    """
    Properly converts Turkish text to lowercase preserving I -> ı and İ -> i.
    """
    if not text:
        return ""
    return text.replace("İ", "i").replace("I", "ı").lower()

def turkish_upper(text: str) -> str:
    """
    Properly converts Turkish text to uppercase preserving i -> İ and ı -> I.
    """
    if not text:
        return ""
    mapping = {
        ord('i'): 'İ',
        ord('ı'): 'I',
        ord('ş'): 'Ş',
        ord('ğ'): 'Ğ',
        ord('ü'): 'Ü',
        ord('ö'): 'Ö',
        ord('ç'): 'Ç'
    }
    return text.translate(mapping).upper()

# Academic and General Turkish Stop-Words
TURKISH_STOP_WORDS: Set[str] = {
    # Bağlaçlar ve edatlar
    "ve", "veya", "ile", "için", "bir", "bu", "şu", "o", "da", "de", "ta", "te",
    "ise", "ki", "çünkü", "ama", "fakat", "ancak", "lakin", "yahut", "velev",
    "gibi", "kadar", "göre", "dolayı", "ötürü", "rağmen", "karşın", "itibaren",
    "doğru", "karşı", "üzerine", "altında", "içinde", "arasında", "boyunca",
    # Zamirler
    "ben", "sen", "biz", "siz", "onlar", "bana", "sana", "ona", "bize", "size", "onlara",
    "beni", "seni", "onu", "bizi", "sizi", "onları", "benim", "senin", "onun", "bizim", "sizin", "onların",
    "kendisi", "kendileri", "kendi", "biri", "birisi", "birkaçı", "hepsi", "tümü", "hiçbiri",
    "bazısı", "bazıları", "kim", "ne", "hangi", "nerede", "nasıl", "neden", "niçin",
    # Zaman ve zarf kelimeleri
    "artık", "asla", "henüz", "daha", "en", "çok", "az", "pek", "gayet", "oldukça",
    "şimdi", "sonra", "önce", "daima", "her", "zaman", "hiç", "zaten", "bile", "dahi",
    # Genel fiiller / yardımcı fiiller
    "olmak", "olduğu", "olduğuyla", "olması", "olan", "olarak", "olup", "olur",
    "etmek", "ettiği", "etmesi", "eden", "ederek", "edilen", "edilmiş",
    "yapmak", "yaptığı", "yapılması", "yapan", "yaparak",
    "bulunmak", "bulunan", "bulunmaktadır", "görülmektedir", "belirtilmektedir",
    # Akademik dolgu terimleri
    "şeklinde", "açısından", "bakımından", "yönüyle", "tarafından", "amacıyla",
    "kapsamında", "doğrultusunda", "bağlamında", "çerçevesinde", "nedeniyle",
    "birlikte", "sırasında", "esnasında", "örneğin", "özellikle", "genel", "olarak"
}

def clean_academic_text(raw_text: str) -> str:
    """
    Cleans bracketed citations (e.g., [1], [2-4], [Smith et al., 2020], [Yılmaz vd., 2021]),
    URLs, DOIs, page markers, and excessive whitespace.
    """
    if not raw_text:
        return ""

    # Replace academic citation brackets like [1], [1, 2], [Smith et al., 2021]
    text = re.sub(r'\[\s*\d+(?:[\s,\-–]+\d+)*\s*\]', ' ', raw_text)
    text = re.sub(r'\[\s*[A-Za-zÇĞİÖŞÜa-zçğıöşü\s.,]+(?:\d{4})?[^\]]*\]', ' ', text)
    
    # Replace URLs and DOIs
    text = re.sub(r'https?://\S+|www\.\S+|doi:\s*\S+', ' ', text, flags=re.IGNORECASE)
    
    # Clean email addresses
    text = re.sub(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b', ' ', text)
    
    # Replace weird unicode dashes and quotes
    text = text.replace('“', '"').replace('”', '"').replace('’', "'").replace('‘', "'")
    text = text.replace('–', '-').replace('—', '-')
    
    # Normalize multiple whitespace and newlines
    text = re.sub(r'[ \t]+', ' ', text)
    text = re.sub(r'\n\s*\n+', '\n\n', text)
    
    return text.strip()

def split_into_sentences(text: str) -> List[str]:
    """
    Splits Turkish academic text into sentences, taking care of abbreviations
    (Prof., Dr., vd., vb., bkz., örn., No., vs.) so they don't break prematurely.
    """
    if not text:
        return []

    # Protect common Turkish abbreviations with a placeholder
    abbrevs = {
        r'\bProf\.': 'Prof_DOT_',
        r'\bDr\.': 'Dr_DOT_',
        r'\bDoç\.': 'Doc_DOT_',
        r'\bYrd\.': 'Yrd_DOT_',
        r'\bvd\.': 'vd_DOT_',
        r'\bvb\.': 'vb_DOT_',
        r'\bbkz\.': 'bkz_DOT_',
        r'\börn\.': 'orn_DOT_',
        r'\bvs\.': 'vs_DOT_',
        r'\bNo\.': 'No_DOT_',
        r'\bMad\.': 'Mad_DOT_',
        r'\bs\.': 's_DOT_',
    }
    protected = text
    for pattern, rep in abbrevs.items():
        protected = re.sub(pattern, rep, protected, flags=re.IGNORECASE)

    # Split on sentence boundaries: . ! ? followed by whitespace or newline
    raw_sentences = re.split(r'(?<=[.!?])\s+(?=[A-ZÇĞİÖŞÜ0-9"\'])', protected)

    sentences = []
    for s in raw_sentences:
        clean_s = s.strip()
        # Restore protected abbreviation dots
        clean_s = re.sub(r'(\w+)_DOT_', r'\1.', clean_s)
        # Avoid tiny artifact sentences
        if len(clean_s) > 10:
            sentences.append(clean_s)

    return sentences

def tokenize_words(sentence: str, remove_stopwords: bool = True) -> List[str]:
    """
    Extracts alphanumeric words from sentence, applies Turkish lowercasing,
    and optionally filters out stop words and single-character artifacts.
    """
    clean_s = turkish_lower(sentence)
    # Match Turkish word characters: letters, digits, and internal hyphens
    tokens = re.findall(r'[a-zçğıöşü0-9]+(?:-[a-zçğıöşü0-9]+)*', clean_s)

    if remove_stopwords:
        tokens = [
            t for t in tokens
            if len(t) > 1 and t not in TURKISH_STOP_WORDS and not t.isdigit()
        ]
    return tokens
