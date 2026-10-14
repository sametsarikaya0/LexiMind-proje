"""
LexiMind — Türkçe Metin Ön İşleme ve Tokenization Modülü

Bu modül, Türkçe metinlerin Word2Vec eğitimi ve analizi için
doğru biçimde temizlenmesini, normalize edilmesini ve belirteçlere (token)
ayrılmasını sağlar. Türkçe karakter haritalaması ('I' -> 'ı', 'İ' -> 'i')
titizlikle ele alınmıştır.
"""

import re
from typing import List, Set
from nlp.config import TURKISH_STOP_WORDS, TURKISH_CHAR_LOWER_MAP

def turkish_lower(text: str) -> str:
    """
    Türkçe büyük harfleri kurallara uygun olarak küçük harfe çevirir.
    Örnek: 'IĞDIR' -> 'ığdır', 'İSTANBUL' -> 'istanbul'
    """
    if not text or not isinstance(text, str):
        return ""
    mapping = {
        'I': 'ı',
        'İ': 'i',
    }
    for upper_char, lower_char in mapping.items():
        text = text.replace(upper_char, lower_char)
    return text.lower()


def clean_text(text: str) -> str:
    """
    Metindeki URL'leri, e-postaları, sayıları ve gereksiz noktalama işaretlerini temizler.
    Yalnızca Türkçe ve latin harfler ile boşlukları muhafaza eder.
    Aşırı kök kesme veya anlam bozucu normalleştirmeden kaçınır.
    """
    if not text or not isinstance(text, str):
        return ""
    
    # Türkçe küçük harfe çevir
    normalized = turkish_lower(text)
    
    # URL ve e-posta adreslerini kaldır
    normalized = re.sub(r'https?://\S+|www\.\S+', ' ', normalized)
    normalized = re.sub(r'\S+@\S+', ' ', normalized)
    
    # Noktalama işaretleri, sayılar ve özel simgeleri temizle
    # İzin verilen karakterler: a-z, Türkçe karakterler (ç, ğ, ı, ö, ş, ü, â, î, û), boşluk
    normalized = re.sub(r'[^a-zçğıöşüâîû\s]', ' ', normalized)
    
    # Çoklu boşlukları tek boşluğa indir
    normalized = re.sub(r'\s+', ' ', normalized).strip()
    return normalized


def filter_stopwords(tokens: List[str]) -> List[str]:
    """
    Verilen token listesinden Türkçe stop-word'leri ayıklar.
    """
    if not tokens:
        return []
    return [t for t in tokens if t not in TURKISH_STOP_WORDS]


def tokenize(text: str, remove_stopwords: bool = False, min_word_length: int = 2) -> List[str]:
    """
    Metni temizler ve kelime belirteçlerine (token) ayırır.
    İsteğe bağlı olarak stop words filtrelemesi ve minimum uzunluk filtresi uygular.
    """
    cleaned = clean_text(text)
    if not cleaned:
        return []
    
    tokens = cleaned.split()
    
    # Uzunluk filtresi
    tokens = [t for t in tokens if len(t) >= min_word_length]
    
    if remove_stopwords:
        tokens = filter_stopwords(tokens)
        
    return tokens


def split_sentences(text: str) -> List[str]:
    """
    Geniş bir metni cümle sınırlarına göre böler (. ! ? satır sonları).
    Boş veya tek karakterlik anlamsız parçaları eler.
    """
    if not text or not isinstance(text, str):
        return []
    raw_sentences = re.split(r'[\n\r]+|[.!?]+\s*', text)
    return [s.strip() for s in raw_sentences if len(s.strip()) > 2]
