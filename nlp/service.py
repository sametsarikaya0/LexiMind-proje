"""
LexiMind — NLP Servis Katmanı

Word2Vec modelini belleğe yükler, HTTP istekleri arasında yeniden eğitilmeden
tek bir örnek (Singleton benzeri) üzerinden benzerlik, karşılaştırma, PCA 2D izdüşümü,
metin vektörü ve analiz işlemlerini yürütür.
"""

import os
import sys
from collections import Counter
from typing import Dict, Any, List, Optional

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import numpy as np
from gensim.models import Word2Vec

from nlp.preprocessing import tokenize, clean_text, turkish_lower, split_sentences
from nlp.train import (
    DEFAULT_CORPUS_PATH,
    DEFAULT_MODEL_PATH,
    DEFAULT_EVAL_PATH,
    train_word2vec_model,
    evaluate_model_on_benchmark,
    compute_corpus_statistics
)

class NLPService:
    def __init__(self, model_path: str = DEFAULT_MODEL_PATH, corpus_path: str = DEFAULT_CORPUS_PATH):
        self.model_path = model_path
        self.corpus_path = corpus_path
        self.model: Optional[Word2Vec] = None
        self.is_loaded: bool = False
        self.training_metadata: Dict[str, Any] = {}
        self._eval_cache: Optional[Dict[str, Any]] = None
        self._ascii_map: Dict[str, str] = {}
        
        # Modeli başlat
        self._initialize_model()

    def _build_vocab_indexes(self):
        """
        Hızlı Türkçe harf ve morfolojik eşleme için indeksleri kurar.
        """
        self._ascii_map = {}
        if not self.is_loaded or self.model is None:
            return

        def to_ascii_simple(s: str) -> str:
            rep = {
                'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
                'â': 'a', 'î': 'i', 'û': 'u'
            }
            return "".join(rep.get(ch, ch) for ch in s)

        for w in self.model.wv.key_to_index:
            asc = to_ascii_simple(w)
            if asc not in self._ascii_map:
                self._ascii_map[asc] = w

    def _initialize_model(self):
        """
        Model dosyası varsa yükler; yoksa kontrollü biçimde derlemden eğitir.
        """
        if os.path.exists(self.model_path):
            try:
                self.model = Word2Vec.load(self.model_path)
                self.is_loaded = True
                self.training_metadata = {
                    "source": "loaded_from_disk",
                    "path": self.model_path
                }
                self._build_vocab_indexes()
                return
            except Exception as e:
                print(f"[LexiMind] Mevcut model yüklenirken hata oluştu ({e}), yeniden eğitiliyor...")
        
        # Model yoksa veya bozulmuşsa eğit
        print("[LexiMind] Model diskte bulunamadı. Derlemden otomatik eğitiliyor...")
        try:
            report = train_word2vec_model(
                corpus_path=self.corpus_path,
                model_save_path=self.model_path
            )
            self.model = Word2Vec.load(self.model_path)
            self.is_loaded = True
            self.training_metadata = report
            self._build_vocab_indexes()
            print(f"[LexiMind] Model başarıyla eğitildi ve yüklendi. Sözlük: {len(self.model.wv.key_to_index)} kelime.")
        except Exception as e:
            print(f"[LexiMind] Model eğitimi sırasında kritik hata: {e}")
            self.is_loaded = False
            self.model = None
        except Exception as e:
            print(f"[LexiMind] Model eğitimi sırasında kritik hata: {e}")
            self.is_loaded = False
            self.model = None

    def get_model_info(self) -> Dict[str, Any]:
        """
        Modelin mimarisi, parametreleri ve sözlük büyüklüğü hakkında teknik bilgi döner.
        """
        if not self.is_loaded or self.model is None:
            return {
                "status": "not_loaded",
                "message": "Word2Vec modeli henüz yüklenmedi veya eğitilemedi."
            }

        vocab_size = len(self.model.wv.key_to_index)
        return {
            "status": "ready",
            "algorithm": "Word2Vec (Skip-gram)",
            "vector_size": self.model.vector_size,
            "window": self.model.window,
            "min_count": self.model.min_count,
            "negative_sampling": getattr(self.model, "negative", 5),
            "sg": 1,
            "epochs": self.model.epochs,
            "vocab_size": vocab_size,
            "corpus_description": "Genişletilmiş Türkçe Semantik Derlem (Bilim, Teknoloji, Hukuk, Edebiyat, Doğa, Sağlık)",
            "known_limitations": [
                "Eğitim derlemi akademik ve laboratuvar gösterim amaçlıdır (~1.200 kelime).",
                "Türkçe sondan eklemeli bir dil olduğundan kök-ek ayrımı yapılmayan modellerde morfolojik varyans oluşur.",
                "Word2Vec statik vektör kullandığından eş sesli (homonim) kelimeler tek bir vektörde birleşir."
            ],
            "training_metadata": self.training_metadata
        }

    def resolve_word(self, word: str) -> Dict[str, Any]:
        """
        Kullanıcıdan gelen kelimeyi Türkçe morfolojik kurallara göre akıllıca çözer:
        1. Tam eşleşme (Exact match: 'kitap', 'bilgisayar')
        2. ASCII / Türkçe karakter normalleştirmesi (öğrenci <-> ogrenci, yazılım <-> yazilim, sağlık <-> saglik)
        3. Çekim ve yapım ekleri ayıklama (Stemming: -ler, -da, -den, -nin, -lik, -ci vb. -> kitaplar -> kitap)
        4. Kök kelimenin ASCII eşlemesi (ogrenciler -> öğrenci)
        """
        if not self.is_loaded or self.model is None:
            return {"found": False, "word": "", "original_query": "", "message": "Model henüz hazır değil."}

        clean_w = turkish_lower(word.strip())
        if not clean_w:
            return {"found": False, "word": "", "original_query": "", "message": "Aranan kelime boş olamaz."}

        # 1. Doğrudan model sözlüğünde var mı?
        if clean_w in self.model.wv.key_to_index:
            return {
                "found": True,
                "word": clean_w,
                "original_query": clean_w,
                "match_type": "exact",
                "note": None,
                "vector": self.model.wv[clean_w]
            }

        # 2. ASCII harf varyasyonu mu? (Örn. 'ogrenci' -> 'öğrenci', 'yazilim' -> 'yazılım', 'saglik' -> 'sağlık')
        if clean_w in self._ascii_map:
            mapped = self._ascii_map[clean_w]
            return {
                "found": True,
                "word": mapped,
                "original_query": clean_w,
                "match_type": "diacritic",
                "note": f"Türkçe karakter eşlemesi uygulandı ('{mapped}')",
                "vector": self.model.wv[mapped]
            }

        # 3. Türkçe ek ayıklama (Stemming / Suffix stripping)
        suffixes = [
            "lerinde", "larında", "lerinin", "larının", "lerinden", "larından",
            "leriyle", "larıyla", "lerimiz", "larımız", "lerini", "larını",
            "lerine", "larına", "lerde", "larda", "lerden", "lardan",
            "lerle", "larla", "lerin", "ların", "lerim", "larım",
            "imiz", "ımız", "ümüz", "umuz", "iniz", "ınız", "ünüz", "unuz",
            "sindeki", "sındaki", "sinde", "sında", "sinden", "sından", "sine", "sına", "sini", "sını",
            "daki", "deki", "taki", "teki",
            "cilik", "cılık", "cülük", "culuk",
            "likler", "lıklar", "lükler", "luklar",
            "inden", "ından", "ünden", "undan",
            "inde", "ında", "ünde", "unda",
            "kten", "ktan", "den", "dan", "ten", "tan",
            "ler", "lar", "nin", "nın", "nün", "nun",
            "dir", "dır", "dür", "dur", "tir", "tır", "tür", "tur",
            "lik", "lık", "lük", "luk", "ci", "cı", "cü", "cu",
            "de", "da", "te", "ta", "ye", "ya", "yi", "yı", "yu", "yü",
            "in", "ın", "ün", "un", "im", "ım", "üm", "um",
            "i", "ı", "ü", "u", "e", "a"
        ]

        for s in suffixes:
            if clean_w.endswith(s) and len(clean_w) - len(s) >= 2:
                stem = clean_w[:-len(s)]
                # Doğrudan kök sözlükte var mı?
                if stem in self.model.wv.key_to_index:
                    return {
                        "found": True,
                        "word": stem,
                        "original_query": clean_w,
                        "match_type": "stem",
                        "note": f"Ek (-{s}) ayrıştırıldı; kök '{stem}' üzerinden analiz edildi.",
                        "vector": self.model.wv[stem]
                    }
                # Kökün ASCII eşlemesi var mı?
                if stem in self._ascii_map:
                    mapped_stem = self._ascii_map[stem]
                    return {
                        "found": True,
                        "word": mapped_stem,
                        "original_query": clean_w,
                        "match_type": "stem+diacritic",
                        "note": f"Ek (-{s}) ayrıştırıldı ve karakter düzeltildi; '{mapped_stem}' kökü kullanıldı.",
                        "vector": self.model.wv[mapped_stem]
                    }

        # 4. Bulunamadı -> öneriler üret
        import difflib
        vocab_keys = list(self.model.wv.key_to_index.keys())
        suggestions = difflib.get_close_matches(clean_w, vocab_keys, n=6, cutoff=0.55)
        if not suggestions:
            suggestions = [v for v in vocab_keys if clean_w in v or v.startswith(clean_w[:2])][:6]

        return {
            "found": False,
            "word": clean_w,
            "original_query": clean_w,
            "match_type": "not_found",
            "message": f"'{clean_w}' kelimesi modelin eğitim sözlüğünde bulunamadı.",
            "suggestions": suggestions,
            "similar_words": []
        }

    def get_similar_words(self, word: str, top_n: int = 10) -> Dict[str, Any]:
        """
        Belirtilen Türkçe kelime için kosinüs benzerliği en yüksek kelimeleri döndürür.
        Ek ve ASCII toleransı ile tam arama sağlar.
        """
        if not self.is_loaded or self.model is None:
            raise RuntimeError("Model hazır değil.")

        clean_w = turkish_lower(word.strip())
        if not clean_w:
            raise ValueError("Aranan kelime boş olamaz.")

        resolution = self.resolve_word(word)
        if not resolution["found"]:
            return resolution

        resolved_w = resolution["word"]
        target_vec = resolution["vector"]
        query_w = resolution["original_query"]

        raw_similarities = self.model.wv.similar_by_vector(target_vec, topn=top_n + 5)
        results = []
        for neighbor, score in raw_similarities:
            if neighbor == resolved_w or neighbor == query_w:
                continue
            results.append({
                "word": neighbor,
                "score": round(float(score), 4),
                "percentage_display": f"{round(float(score) * 100, 1)}%"
            })
            if len(results) == top_n:
                break

        return {
            "found": True,
            "word": resolved_w,
            "original_query": query_w,
            "match_type": resolution["match_type"],
            "resolution_note": resolution.get("note"),
            "top_n": top_n,
            "similar_words": results,
            "vector_norm": round(float(np.linalg.norm(target_vec)), 4)
        }

    def compare_words(self, word1: str, word2: str) -> Dict[str, Any]:
        """
        İki kelimenin Word2Vec vektörleri arasındaki kosinüs benzerliğini hesaplar ve yorumlar.
        Ham kosinüs skoru [-1.0, 1.0] aralığında kalır, negatif skorlar gizlenmez.
        Ek ve ASCII toleransı ile karşılaştırma yürütür.
        """
        if not self.is_loaded or self.model is None:
            raise RuntimeError("Model hazır değil.")

        res1 = self.resolve_word(word1)
        res2 = self.resolve_word(word2)

        missing = []
        if not res1["found"]:
            missing.append(res1.get("original_query", word1))
        if not res2["found"]:
            missing.append(res2.get("original_query", word2))

        if missing:
            return {
                "success": False,
                "message": f"Şu kelime(ler) model sözlüğünde bulunamadı: {', '.join(missing)}",
                "missing_words": missing
            }

        w1 = res1["word"]
        w2 = res2["word"]
        vec1 = res1["vector"]
        vec2 = res2["vector"]

        norm1 = np.linalg.norm(vec1)
        norm2 = np.linalg.norm(vec2)
        if norm1 > 0 and norm2 > 0:
            cosine_sim = float(np.dot(vec1, vec2) / (norm1 * norm2))
        else:
            cosine_sim = 0.0
        raw_score = round(cosine_sim, 4)

        if raw_score >= 0.70:
            interpretation = "Çok yüksek anlamsal yakınlık ve bağlamsal eş-oluşum (aynı tematik alan)."
            relation_level = "Çok Yüksek"
        elif raw_score >= 0.40:
            interpretation = "Belirgin anlamsal ilişki veya benzer bağlamlarda sık birlikte geçiş."
            relation_level = "Orta / Yüksek"
        elif raw_score >= 0.15:
            interpretation = "Zayıf-orta düzeyde bağlamsal ilişki."
            relation_level = "Zayıf"
        elif raw_score >= 0.0:
            interpretation = "Çok zayıf ilişki; kelimeler farklı kavram alanlarına ait olabilir."
            relation_level = "İlişkisiz"
        else:
            interpretation = "Negatif kosinüs skoru; vektörler uzayda zıt yönlü yönelim sergilemektedir."
            relation_level = "Zıt Yönelim"

        euclidean_dist = round(float(np.linalg.norm(vec1 - vec2)), 4)

        notes = []
        if res1.get("note"):
            notes.append(f"'{word1}': {res1['note']}")
        if res2.get("note"):
            notes.append(f"'{word2}': {res2['note']}")

        return {
            "success": True,
            "word1": w1,
            "word2": w2,
            "original_word1": res1.get("original_query"),
            "original_word2": res2.get("original_query"),
            "resolution_note": "; ".join(notes) if notes else None,
            "cosine_similarity": raw_score,
            "euclidean_distance": euclidean_dist,
            "relation_level": relation_level,
            "interpretation": interpretation,
            "academic_disclaimer": (
                "Kosinüs benzerliği n-boyutlu vektör uzayındaki açısal yakınlığı ölçer; "
                "bu sayısal değer birebir insan algısındaki mutlak eşitlik yüzdesi değildir."
            )
        }

        vec1 = self.model.wv[w1]
        vec2 = self.model.wv[w2]
        euclidean_dist = round(float(np.linalg.norm(vec1 - vec2)), 4)

        return {
            "success": True,
            "word1": w1,
            "word2": w2,
            "cosine_similarity": raw_score,
            "euclidean_distance": euclidean_dist,
            "relation_level": relation_level,
            "interpretation": interpretation,
            "academic_disclaimer": (
                "Kosinüs benzerliği n-boyutlu vektör uzayındaki açısal yakınlığı ölçer; "
                "bu sayısal değer birebir insan algısındaki mutlak eşitlik yüzdesi değildir."
            )
        }

    def analyze_text(self, text: str) -> Dict[str, Any]:
        """
        Kullanıcı metnini analiz eder:
        Cümle, karakter, kelime, benzersiz kelime sayısı, en sık kullanılan kelimeler,
        model sözlüğü kapsaması ve ortalama metin embedding vektörü.
        """
        if not text or not text.strip():
            raise ValueError("Analiz edilecek metin boş bırakılamaz.")

        total_chars = len(text)
        cleaned = clean_text(text)
        sentences = split_sentences(text)
        total_sentences = len(sentences)
        all_tokens = tokenize(text, remove_stopwords=False)
        content_tokens = tokenize(text, remove_stopwords=True)

        total_words = len(all_tokens)
        if total_words == 0:
            return {
                "total_characters": total_chars,
                "total_sentences": total_sentences,
                "total_words": 0,
                "unique_words": 0,
                "vocabulary_coverage_percent": 0.0,
                "top_words": [],
                "cleaned_text_preview": "",
                "sample_tokens": [],
                "text_vector_norm": None
            }

        unique_tokens = set(all_tokens)
        unique_word_count = len(unique_tokens)

        counter = Counter(content_tokens if content_tokens else all_tokens)
        top_words = [
            {"word": word, "count": count, "frequency_ratio": round(count / total_words, 4)}
            for word, count in counter.most_common(10)
        ]

        # Model sözlüğü kapsama oranı & ortalama metin vektörü
        in_vocab_count = 0
        known_vectors = []
        if self.is_loaded and self.model is not None:
            vocab = self.model.wv.key_to_index
            for w in all_tokens:
                if w in vocab:
                    in_vocab_count += 1
                    known_vectors.append(self.model.wv[w])
            coverage = round((in_vocab_count / total_words) * 100, 2)
        else:
            coverage = 0.0

        # Ortalama metin vektörü hesaplama (Document / Text Mean Vector)
        text_vector_norm = None
        closest_topics = []
        if known_vectors:
            mean_vector = np.mean(known_vectors, axis=0)
            text_vector_norm = round(float(np.linalg.norm(mean_vector)), 4)
            # En yakın 5 tematik kelime
            try:
                closest_topics = [
                    {"word": w, "score": round(float(s), 4)}
                    for w, s in self.model.wv.similar_by_vector(mean_vector, topn=5)
                ]
            except Exception:
                pass

        return {
            "total_characters": total_chars,
            "total_sentences": total_sentences,
            "total_words": total_words,
            "unique_words": unique_word_count,
            "in_vocab_words": in_vocab_count,
            "vocabulary_coverage_percent": coverage,
            "top_words": top_words,
            "cleaned_text_preview": cleaned[:300] + ("..." if len(cleaned) > 300 else ""),
            "sample_tokens": all_tokens[:25],
            "text_vector_norm": text_vector_norm,
            "closest_semantic_topics": closest_topics
        }

    def project_word_vectors(self, words: Optional[List[str]] = None, center_word: Optional[str] = None, top_n: int = 15) -> Dict[str, Any]:
        """
        Word2Vec kelime vektörlerini Temel Bileşen Analizi (PCA / SVD) kullanarak
        2 boyuta (x, y) indirger. Rastgele değil, gerçek matematiksel projeksiyondur.
        """
        if not self.is_loaded or self.model is None:
            raise RuntimeError("Model hazır değil.")

        target_words: List[str] = []

        # Eğer merkez kelime verildiyse en yakın komşularını dahil et
        if center_word:
            cw = turkish_lower(center_word.strip())
            if cw in self.model.wv.key_to_index:
                target_words.append(cw)
                neighbors = self.model.wv.most_similar(cw, topn=top_n)
                target_words.extend([n[0] for n in neighbors])

        # Eğer kelime listesi verildiyse ekle
        if words:
            for w in words:
                clean_w = turkish_lower(w.strip())
                if clean_w in self.model.wv.key_to_index and clean_w not in target_words:
                    target_words.append(clean_w)

        # Hiçbir kelime belirtilmediyse sözlükten örnek bir küme al
        if not target_words:
            default_seeds = ["bilgisayar", "yazılım", "doktor", "sağlık", "öğrenci", "üniversite", "hukuk", "adalet", "güneş", "yıldız", "felsefe", "akıl"]
            for s in default_seeds:
                if s in self.model.wv.key_to_index:
                    target_words.append(s)

        if len(target_words) < 3:
            raise ValueError("2D PCA projeksiyonu için en az 3 geçerli kelime gereklidir.")

        # Vektör matrisini oluştur: shape (N, vector_size)
        vectors = np.array([self.model.wv[w] for w in target_words])

        # PCA: Matrisi merkezileştir (Mean centering)
        mean_vec = np.mean(vectors, axis=0)
        centered_vectors = vectors - mean_vec

        # Tekil Değer Ayrışımı (SVD) ile ilk 2 temel bileşeni çıkar
        # centered_vectors = U * S * Vt
        u, s, vt = np.linalg.svd(centered_vectors, full_matrices=False)
        # 2D koordinatları: X_proj = centered_vectors @ Vt[:2].T
        projected = np.dot(centered_vectors, vt[:2].T)

        # Koordinatları görselleştirme için normalize et [-100, 100] aralığı
        max_val = np.max(np.abs(projected)) if np.max(np.abs(projected)) > 0 else 1.0
        normalized = (projected / max_val) * 100

        # Açıklanan varyans oranı
        total_variance = np.sum(s ** 2) if np.sum(s ** 2) > 0 else 1.0
        explained_variance_2d = float(np.sum(s[:2] ** 2) / total_variance)

        points = []
        for i, word in enumerate(target_words):
            points.append({
                "word": word,
                "x": round(float(normalized[i, 0]), 2),
                "y": round(float(normalized[i, 1]), 2),
                "raw_x": round(float(projected[i, 0]), 4),
                "raw_y": round(float(projected[i, 1]), 4),
                "is_center": (word == center_word)
            })

        return {
            "method": "PCA (Principal Component Analysis via SVD)",
            "dimension": 2,
            "word_count": len(points),
            "explained_variance_ratio": round(explained_variance_2d, 4),
            "points": points,
            "center_word": center_word
        }

    def get_vocabulary(self, limit: int = 100, search: str = "") -> Dict[str, Any]:
        """
        Model sözlüğündeki kelimeleri listeler.
        """
        if not self.is_loaded or self.model is None:
            return {"words": [], "total_count": 0}

        vocab = self.model.wv.key_to_index
        all_words = list(vocab.keys())

        if search:
            clean_s = turkish_lower(search.strip())
            filtered = [w for w in all_words if clean_s in w]
        else:
            filtered = all_words

        return {
            "total_vocabulary_size": len(all_words),
            "filtered_count": len(filtered),
            "words": filtered[:limit]
        }

    def get_network(self, center_word: str, top_n: int = 8) -> Dict[str, Any]:
        """
        Ağ grafiği için gerçek kosinüs benzerliği bağlantılarını üretir.
        Düğümler ve kenarlar Gensim modelinden doğrudan hesaplanır.
        """
        if not self.is_loaded or self.model is None:
            raise RuntimeError("Model hazır değil.")

        c_word = turkish_lower(center_word.strip())
        if c_word not in self.model.wv.key_to_index:
            raise ValueError(f"'{c_word}' kelimesi sözlükte bulunamadı.")

        # Performans için düğüm sınırlandırması: top_n max 20
        safe_top_n = min(top_n, 20)
        neighbors = self.model.wv.most_similar(c_word, topn=safe_top_n)
        nodes = [{"id": c_word, "label": c_word, "group": "center", "weight": 1.0}]
        links = []

        neighbor_words = [n[0] for n in neighbors]
        for neighbor, score in neighbors:
            nodes.append({
                "id": neighbor,
                "label": neighbor,
                "group": "neighbor",
                "weight": round(float(score), 3)
            })
            links.append({
                "source": c_word,
                "target": neighbor,
                "value": round(float(score), 3)
            })

        # Komşular arasındaki ilişkileri de hesapla
        for i in range(len(neighbor_words)):
            for j in range(i + 1, len(neighbor_words)):
                w_a = neighbor_words[i]
                w_b = neighbor_words[j]
                cross_sim = float(self.model.wv.similarity(w_a, w_b))
                if cross_sim >= 0.35:
                    links.append({
                        "source": w_a,
                        "target": w_b,
                        "value": round(cross_sim, 3)
                    })

        return {
            "center_word": c_word,
            "nodes": nodes,
            "links": links
        }

    def get_evaluation(self) -> Dict[str, Any]:
        """
        Modelin değerlendirme sonuçlarını döner.
        """
        if not self.is_loaded or self.model is None:
            raise RuntimeError("Model hazır değil.")
        if self._eval_cache is None:
            self._eval_cache = evaluate_model_on_benchmark(self.model)
        return self._eval_cache

    def get_analogy(self, positive: List[str], negative: List[str], top_n: int = 5) -> Dict[str, Any]:
        """
        Word2Vec vektör aritmetiği ile analoji araması yapar:
        Örnek: kral - erkek + kadın = kraliçe
        Formül: v_hedef ≈ Σ v_pozitif - Σ v_negatif
        Gensim'in gerçek most_similar(positive=..., negative=...) fonksiyonunu kullanır.
        """
        if not self.is_loaded or self.model is None:
            raise RuntimeError("Model hazır değil.")

        clean_pos = [turkish_lower(w.strip()) for w in positive if w and w.strip()]
        clean_neg = [turkish_lower(w.strip()) for w in negative if w and w.strip()]

        if not clean_pos:
            raise ValueError("En az bir pozitif referans kelimesi girilmelidir.")

        # Sözlük kontrolü
        missing_words = []
        for w in clean_pos + clean_neg:
            if w not in self.model.wv.key_to_index:
                missing_words.append(w)

        if missing_words:
            return {
                "success": False,
                "positive": clean_pos,
                "negative": clean_neg,
                "message": f"Şu analoji kelimeleri sözlükte bulunamadı: {', '.join(missing_words)}",
                "missing_words": missing_words,
                "results": []
            }

        try:
            raw_results = self.model.wv.most_similar(positive=clean_pos, negative=clean_neg, topn=top_n)
            results = [
                {
                    "word": w,
                    "score": round(float(s), 4),
                    "percentage_display": f"{round(float(s) * 100, 1)}%"
                }
                for w, s in raw_results
            ]

            equation_display = " + ".join(clean_pos)
            if clean_neg:
                equation_display += " - " + " - ".join(clean_neg)

            return {
                "success": True,
                "positive": clean_pos,
                "negative": clean_neg,
                "equation": equation_display,
                "top_n": top_n,
                "results": results,
                "scientific_explanation": (
                    "Bu işlem yüksek boyutlu vektör uzayında yönsel vektör toplama ve çıkarma "
                    "(v_A - v_B + v_C) cebirsel işleminin kosinüs mesafesi en yakın izdüşümüdür. "
                    "Word2Vec'in lineer kompozisyon kabiliyetini gösteren deneysel bir keşif aracıdır."
                )
            }
        except Exception as e:
            return {
                "success": False,
                "positive": clean_pos,
                "negative": clean_neg,
                "message": f"Analoji hesaplama hatası: {str(e)}",
                "missing_words": [],
                "results": []
            }

    def get_corpus_statistics(self) -> Dict[str, Any]:
        """
        Eğitim derleminin frekans ve hacimsel istatistiklerini hesaplar ve döner.
        """
        return compute_corpus_statistics(self.corpus_path)

    def train_custom_model(self, params: Dict[str, Any], custom_text: Optional[str] = None) -> Dict[str, Any]:
        """
        Özel hiperparametrelerle ve opsiyonel kullanıcı metniyle modeli yeniden eğitir.
        Gensim Word2Vec kütüphanesini doğrudan çalıştırır ve bellekteki modeli günceller.
        """
        custom_sentences = None
        if custom_text and custom_text.strip():
            raw_sents = split_sentences(custom_text)
            custom_sentences = []
            for s in raw_sents:
                toks = tokenize(s, remove_stopwords=False)
                if len(toks) >= 2:
                    custom_sentences.append(toks)
            
            if len(custom_sentences) < 2:
                raise ValueError("Özel eğitim metni en az 2 geçerli cümle içermelidir.")

        report = train_word2vec_model(
            corpus_path=self.corpus_path,
            model_save_path=self.model_path,
            params=params,
            custom_sentences=custom_sentences
        )

        # Modeli belleğe yeniden yükle
        self.model = Word2Vec.load(self.model_path)
        self.is_loaded = True
        self.training_metadata = report
        self._eval_cache = None  # Önbelleği temizle

        return report

    def get_model_metadata(self) -> Dict[str, Any]:
        """
        Model mimarisi, kütüphane sürümleri ve vektör detayları hakkında kapsamlı metaveri döner.
        """
        info = self.get_model_info()
        import gensim
        import scipy
        return {
            **info,
            "engine": "Gensim Word2Vec Core",
            "framework_versions": {
                "gensim": gensim.__version__,
                "numpy": np.__version__,
                "scipy": scipy.__version__,
                "python": sys.version.split()[0]
            },
            "vector_format": "float32 (dense)",
            "similarity_metric": "Cosine Similarity (dot product of L2 normalized vectors)",
            "distance_metric": "Euclidean (L2 norm of vector difference)"
        }

# Global singleton servisi
nlp_service = NLPService()
