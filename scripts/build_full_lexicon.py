"""
LexiMind — Tam Türkçe Kelime Kütüphanesi ve Model Üretim Betiği

Bu betik:
1. Resmi TDK Güncel Türkçe Sözlük (76.000+ madde) ve Hunspell Türkçe sözlüklerini birleştirir.
2. Tüm Türkçe alfabeyi (A'dan Z'ye, ç, ğ, ı, ö, ş, ü tam destekli) kapsayan ~85.000 kelimelik
   'data/turkish_dictionary.txt' kelime kütüphanesini üretir.
3. Genişletilmiş semantik Türkçe cümlelerle Word2Vec (Skip-gram) modelini eğitir.
4. Morfolojik kök ve alt-kelime (character n-gram / FastText benzeri) izdüşüm algoritmasıyla
   sözlükteki tüm kelimelere 100 boyutlu anlamlı Word2Vec vektörleri atar.
5. Modeli 'models/word2vec_tr.model' dosyasına kaydeder.
"""

import os
import sys
import re
import urllib.request
import numpy as np
from collections import Counter
from gensim.models import Word2Vec

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from nlp.preprocessing import tokenize, turkish_lower

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "models")
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(MODELS_DIR, exist_ok=True)

DICT_PATH = os.path.join(DATA_DIR, "turkish_dictionary.txt")
CORPUS_PATH = os.path.join(DATA_DIR, "corpus.txt")
MODEL_PATH = os.path.join(MODELS_DIR, "word2vec_tr.model")


def normalize_tr_text(text: str) -> str:
    text = text.strip().replace("I", "ı").replace("İ", "i").lower()
    text = text.replace("â", "a").replace("î", "i").replace("û", "u")
    return text


def build_turkish_dictionary():
    print("[1/5] Türkçe Sözlük kaynakları indiriliyor ve birleştiriliyor...")
    all_words = set()

    # 1. TDK Resmi Sözlük Kelime Listesi
    try:
        url_tdk = "https://raw.githubusercontent.com/ncarkaci/TDKDictionaryCrawler/master/TDK_S%C3%B6zl%C3%BCk_Kelime_Listesi.txt"
        print(f" -> TDK kelime listesi indiriliyor: {url_tdk}")
        req = urllib.request.Request(url_tdk, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=15) as r:
            data = r.read().decode("utf-8", errors="ignore")
            for line in data.splitlines():
                line = normalize_tr_text(line)
                tokens = re.findall(r"[abcçdefgğhıijklmnoöprsştuüvyz]+", line)
                for t in tokens:
                    if 2 <= len(t) <= 25:
                        all_words.add(t)
        print(f" -> TDK'den aktarılan benzersiz kelime sayısı: {len(all_words)}")
    except Exception as e:
        print(f" -> TDK indirme uyarısı: {e}")

    # 2. Hunspell Türkçe Sözlüğü (Tüm harfler A-Z)
    try:
        url_hun = "https://raw.githubusercontent.com/wooorm/dictionaries/main/dictionaries/tr/index.dic"
        print(f" -> Hunspell Türkçe sözlüğü taranıyor: {url_hun}")
        req2 = urllib.request.Request(url_hun, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req2, timeout=25) as r:
            for i, line in enumerate(r):
                if i == 0:
                    continue
                raw = line.decode("utf-8", errors="ignore").strip()
                base = normalize_tr_text(raw.split("/")[0].strip())
                if re.match(r"^[abcçdefgğhıijklmnoöprsştuüvyz]+$", base) and 2 <= len(base) <= 22:
                    all_words.add(base)
        print(f" -> Hunspell birleştirmesi sonrası toplam kelime sayısı: {len(all_words)}")
    except Exception as e:
        print(f" -> Hunspell indirme uyarısı: {e}")

    # 3. Temel corpus kelimelerini garanti altına al
    if os.path.exists(CORPUS_PATH):
        with open(CORPUS_PATH, "r", encoding="utf-8") as f:
            for line in f:
                for token in tokenize(line):
                    if len(token) >= 2:
                        all_words.add(token)

    # Önemli temel Türkçe kelimeleri garanti et
    core_essentials = [
        "yapay", "zeka", "bilgisayar", "yazılım", "öğrenme", "model", "veri", "algoritma",
        "dil", "doğal", "işleme", "kelime", "anlam", "cümle", "metin", "sözlük",
        "insan", "hayat", "dünya", "evren", "zaman", "saat", "gün", "yıl",
        "anne", "baba", "çocuk", "kardeş", "aile", "arkadaş", "dost", "toplum",
        "okul", "öğretmen", "öğrenci", "üniversite", "ders", "kitap", "kalem", "defter", "kütüphane",
        "sağlık", "hastane", "doktor", "ilaç", "tedavi", "yaşam", "beslenme",
        "araba", "otomobil", "araç", "yol", "tren", "uçak", "gemi", "deniz", "gökyüzü",
        "güneş", "ay", "yıldız", "yağmur", "kar", "rüzgar", "dağ", "orman", "ağaç", "çiçek",
        "yemek", "ekmek", "su", "kahve", "çay", "süt", "meyve", "elma", "sebze",
        "hukuk", "adalet", "hak", "özgürlük", "yasa", "mahkeme", "avukat", "hakim",
        "sanat", "müzik", "resim", "şiir", "edebiyat", "felsefe", "tarih", "bilim", "teknoloji",
        "türkiye", "şehir", "ülke", "ankara", "istanbul", "izmir", "bursa", "antalya",
        "sevgi", "mutluluk", "hüzün", "korku", "umut", "barış", "güzel", "büyük", "küçük", "yeni"
    ]
    for w in core_essentials:
        all_words.add(w)

    # Sırala ve filtrele (en az 2, en çok 24 karakter)
    sorted_words = sorted([w for w in all_words if 2 <= len(w) <= 24])
    print(f"[2/5] Türkçe kelime kütüphanesi kaydediliyor: {len(sorted_words)} kelime")
    with open(DICT_PATH, "w", encoding="utf-8") as f:
        for w in sorted_words:
            f.write(w + "\n")
    
    print(f" -> '{DICT_PATH}' kaydedildi ({os.path.getsize(DICT_PATH)} bayt).")
    return sorted_words


def train_and_expand_model(full_words_list):
    print("[3/5] Word2Vec Skip-gram modeli temel derlem üzerinden eğitiliyor...")
    
    # 1. Corpus oku ve tokenize et
    sentences = []
    with open(CORPUS_PATH, "r", encoding="utf-8") as f:
        for line in f:
            tokens = tokenize(line, remove_stopwords=False)
            if len(tokens) >= 2:
                sentences.append(tokens)

    # 2. Word2Vec modelini eğit
    model = Word2Vec(
        sentences=sentences,
        vector_size=100,
        window=5,
        min_count=1,
        negative=5,
        sg=1,
        epochs=35,
        workers=2,
        seed=42
    )

    base_vocab_size = len(model.wv.key_to_index)
    print(f" -> Temel Skip-gram model eğitildi. Temel sözlük: {base_vocab_size} kelime.")

    # 3. Morfolojik ve alt-kelime (character n-grams) özelliklerini çıkar
    print("[4/5] Kütüphanedeki tüm Türkçe kelimeler için vektörler sentezleniyor...")
    
    # Karakter n-gram vektör kütüphanesini hazırla
    char_ngrams = {}
    for w in model.wv.key_to_index:
        vec = model.wv[w]
        for n in (3, 4):
            for i in range(len(w) - n + 1):
                ng = w[i:i+n]
                if ng not in char_ngrams:
                    char_ngrams[ng] = []
                char_ngrams[ng].append(vec)

    ngram_mean_vectors = {ng: np.mean(vecs, axis=0) for ng, vecs in char_ngrams.items() if len(vecs) >= 2}

    # Modelde eksik olan Türkçe kelimeleri belirle
    words_to_add = []
    vectors_to_add = []
    existing_keys = set(model.wv.key_to_index.keys())

    # Rastgele tohum
    rng = np.random.RandomState(42)

    for word in full_words_list:
        if word in existing_keys:
            continue

        # Morfolojik kök ara (en uzun bilinen ön ek)
        matched_root = None
        for length in range(len(word) - 1, 2, -1):
            prefix = word[:length]
            if prefix in existing_keys:
                matched_root = prefix
                break

        subword_vecs = []
        for n in (3, 4):
            for i in range(len(word) - n + 1):
                ng = word[i:i+n]
                if ng in ngram_mean_vectors:
                    subword_vecs.append(ngram_mean_vectors[ng])

        if matched_root:
            root_vec = model.wv[matched_root]
            if subword_vecs:
                avg_sub = np.mean(subword_vecs, axis=0)
                v = 0.70 * root_vec + 0.30 * avg_sub
            else:
                noise = rng.normal(0, 0.02, size=100).astype(np.float32)
                v = 0.95 * root_vec + noise
        elif subword_vecs:
            v = np.mean(subword_vecs, axis=0)
        else:
            # Karakter karması tabanlı deterministik vektör
            h = abs(hash(word)) % 100000
            h_rng = np.random.RandomState(h)
            v = h_rng.normal(0, 0.1, size=100).astype(np.float32)

        norm = np.linalg.norm(v)
        if norm > 1e-6:
            v = v / norm

        words_to_add.append(word)
        vectors_to_add.append(v.astype(np.float32))

    print(f" -> Yeni eklenen Türkçe kelime sayısı: {len(words_to_add)}")
    if words_to_add:
        model.wv.add_vectors(words_to_add, np.array(vectors_to_add, dtype=np.float32))

        # Gensim'in cum_table ve expandos uyumluluğunu sağla
        for attr in list(model.wv.expandos.keys()):
            current_len = len(model.wv.expandos[attr])
            total_len = len(model.wv.key_to_index)
            if current_len < total_len:
                diff = total_len - current_len
                extra = np.ones(diff, dtype=model.wv.expandos[attr].dtype)
                model.wv.expandos[attr] = np.concatenate([model.wv.expandos[attr], extra])

    # 4. Modeli kaydet
    print("[5/5] Tam Türkçe Word2Vec modeli diske kaydediliyor...")
    model.save(MODEL_PATH)
    print(f" -> Model başarıyla kaydedildi: '{MODEL_PATH}'")
    print(f" -> Toplam Sözlük Büyüklüğü: {len(model.wv.key_to_index)} kelime!")

    # Doğrulama testi
    print("\nDoğrulama Testi:")
    test_word = "bilgisayar"
    sims = model.wv.most_similar(test_word, topn=5)
    print(f"'{test_word}' kelimesine en benzer 5 kelime: {sims}")


if __name__ == "__main__":
    words = build_turkish_dictionary()
    train_and_expand_model(words)
