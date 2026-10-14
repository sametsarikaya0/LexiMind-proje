"""
LexiMind — Yapılandırma ve Parametre Yönetimi (nlp/config.py)

=============================================================================
ÖĞRENCİ VE GELİŞTİRİCİ İÇİN KOD DEĞİŞTİRME KILAVUZU:
Bu dosya projenin tüm ayarlarını tek bir merkezde toplar.
Hocanın isteğine veya kendi çalışmanıza göre aşağıdaki değerleri
kolayca değiştirip Word2Vec modelini yeniden eğitebilirsiniz.
=============================================================================
"""

import os
from typing import Dict, Any, Set, List

# ---------------------------------------------------------------------------
# 1. DOSYA VE DİZİN YOLLARI
# Projeye yeni bir metin dosyası (.txt) eklemek isterseniz, dosyanızı data/
# klasörüne koyup DEFAULT_CORPUS_PATH yolunu güncelleyebilirsiniz.
# ---------------------------------------------------------------------------
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DATA_DIR = os.path.join(BASE_DIR, "data")
MODELS_DIR = os.path.join(BASE_DIR, "models")

DEFAULT_CORPUS_PATH = os.path.join(DATA_DIR, "corpus.txt")
DEFAULT_MODEL_PATH = os.path.join(MODELS_DIR, "word2vec_tr.model")
DEFAULT_EVAL_PATH = os.path.join(DATA_DIR, "evaluation_set.json")
TURKISH_DICT_PATH = os.path.join(DATA_DIR, "turkish_dictionary.txt")

# ---------------------------------------------------------------------------
# 2. WORD2VEC EĞİTİM HİPERPARAMETRELERİ
# Word2Vec modelinin varsayılan eğitim parametreleri.
# Hoca parametrelerin ne anlama geldiğini sorarsa:
# - vector_size: Her kelimenin kaç boyutlu bir vektörle temsil edileceği (ör. 100)
# - window: Hedef kelimenin sağı ve solundaki bağlam penceresi genişliği (ör. 5)
# - min_count: Model sözlüğüne dahil edilecek kelimenin minimum geçme sıklığı
# - sg: 1 = Skip-gram (nadir kelimelerde başarılı), 0 = CBOW (daha hızlı)
# - negative: Negatif örnekleme (Negative Sampling k katsayısı, genelde 5-10)
# - epochs: Derlem üzerinden geçilecek tur sayısı (küçük derlemlerde 30-50 önerilir)
# - seed: Rastgele başlangıç tohumu (sonuçların tekrarlanabilir olması için sabit)
# ---------------------------------------------------------------------------
DEFAULT_TRAINING_PARAMS: Dict[str, Any] = {
    "vector_size": 100,       # Vektör boyutu (100 boyutlu uzay)
    "window": 5,              # Bağlam penceresi (±5 kelime)
    "min_count": 1,           # En az 1 kez geçen tüm kelimeleri al
    "negative": 5,            # Negatif örnekleme katsayısı
    "sg": 1,                  # 1 = Skip-gram mimarisi
    "epochs": 40,             # 40 geçiş (epoch)
    "workers": 2,             # Paralel CPU iş parçacığı
    "seed": 42,               # Sabit tohum (tekrarlanabilirlik)
    "compute_loss": True      # Loss takibi
}

# ---------------------------------------------------------------------------
# 3. TÜRKÇE STOP-WORDS (ETKİSİZ KELİMELER) LİSTESİ
# Cümle yapısında sık geçen ancak semantik anlam yükü az olan bağlaç ve edatlar.
# Yeni bir etkisiz kelime eklemek isterseniz listeye doğrudan string ekleyebilirsiniz.
# ---------------------------------------------------------------------------
TURKISH_STOP_WORDS: Set[str] = {
    "acaba", "ama", "ancak", "artık", "asla", "aslında", "az", "bana", "bazen",
    "bazı", "bazıları", "belki", "ben", "beni", "benim", "beri", "bile", "bir",
    "biri", "birkaç", "birkez", "birşey", "biz", "bize", "bizim", "böyle",
    "böylece", "bu", "buna", "bunda", "bundan", "bunu", "bunun", "burada",
    "bütün", "çoğu", "çoğuna", "çoğunu", "çok", "çünkü", "da", "daha", "dahi",
    "de", "defa", "değil", "diye", "dolu", "dolayı", "en", "epey", "fakat",
    "gibi", "göre", "halen", "hangi", "hangisi", "hani", "hatta", "hem", "henüz",
    "hep", "hepsi", "her", "herkes", "herhangi", "hiç", "hiçbiri", "için", "ile",
    "ilgili", "ise", "işte", "itibaren", "kadar", "karşın", "katrilyon", "kendi",
    "kendine", "kendini", "kendisi", "kez", "ki", "kim", "kime", "kimi", "kimse",
    "külliyen", "madem", "mı", "mi", "mu", "mü", "nasıl", "ne", "neden", "nerde",
    "nerede", "nereye", "nitekim", "oysa", "oysaki", "öbürü", "önce", "ötürü",
    "öyle", "pek", "rağmen", "sadece", "sanki", "şayet", "şey", "şimdi", "şöyle",
    "şu", "şuna", "şunda", "şundan", "şunlar", "şunu", "şunun", "tabi", "tam",
    "tamam", "tarafından", "tüm", "üzerine", "var", "ve", "veya", "veyahut",
    "ya", "yani", "yine", "yok", "zaten"
}

# ---------------------------------------------------------------------------
# 4. TÜRKÇE KARAKTER DÖNÜŞÜM KURALLARI
# Python'un standart .lower() fonksiyonu 'I' harfini 'i' yapmaktadır (İngilizce).
# Türkçe'de 'I' -> 'ı' ve 'İ' -> 'i' olmalıdır.
# ---------------------------------------------------------------------------
TURKISH_CHAR_LOWER_MAP = {
    'I': 'ı',
    'İ': 'i',
}

# ---------------------------------------------------------------------------
# 5. AKADEMİK BENZERLİK VE YORUM EŞİKLERİ
# Kosinüs benzerliği skorlarının Türkçe akademik etiketleri:
# ---------------------------------------------------------------------------
SIMILARITY_TIERS: List[Dict[str, Any]] = [
    {"min": 0.70, "max": 1.00, "label": "Çok Yüksek Semantik Benzerlik", "color": "emerald"},
    {"min": 0.45, "max": 0.70, "label": "Yüksek / Güçlü Bağlamsal İlişki", "color": "cyan"},
    {"min": 0.25, "max": 0.45, "label": "Orta Düzey Alan İlişkisi", "color": "amber"},
    {"min": 0.00, "max": 0.25, "label": "Zayıf / Uzak Anlamsal İlişki", "color": "slate"},
    {"min": -1.00, "max": 0.00, "label": "Negatif / Ters Vektörel Yönelim", "color": "rose"},
]
