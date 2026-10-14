"""
LexiMind — Word2Vec Model Eğitimi ve Değerlendirme Modülü

Bu modül Gensim 4.x kullanarak Türkçe derlem üzerinde Word2Vec (Skip-gram)
modelini yapılandırılabilir hiperparametrelerle eğitir ve modelin semantik
başarısını Türkçe referans değerlendirme veri setiyle ölçer.
"""

import os
import sys
import json
import time
from typing import Dict, Any, List, Tuple

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import numpy as np
from gensim.models import Word2Vec
from nlp.preprocessing import tokenize

from nlp.config import (
    DEFAULT_CORPUS_PATH,
    DEFAULT_MODEL_PATH,
    DEFAULT_EVAL_PATH,
    DEFAULT_TRAINING_PARAMS,
    SIMILARITY_TIERS
)


def load_and_clean_corpus(corpus_path: str = DEFAULT_CORPUS_PATH) -> Tuple[List[List[str]], Dict[str, Any]]:
    """
    Derlem dosyasını okur, tekrarlanan satırları ve anlamsız girdileri temizler.
    Eğitim öncesi derlem istatistiklerini raporlar.
    """
    if not os.path.exists(corpus_path):
        raise FileNotFoundError(f"Derlem dosyası bulunamadı: {corpus_path}")

    raw_lines: List[str] = []
    with open(corpus_path, "r", encoding="utf-8") as f:
        for line in f:
            raw_lines.append(line.strip())

    total_raw_lines = len(raw_lines)
    
    # Tekrarlanan ve boş satırları temizle (Deduplication)
    seen_lines = set()
    tokenized_sentences: List[List[str]] = []
    vocabulary_set = set()
    total_tokens = 0

    for line in raw_lines:
        if not line or line in seen_lines:
            continue
        tokens = tokenize(line, remove_stopwords=False)
        if len(tokens) >= 2:  # En az iki kelimelik anlamlı cümleler
            seen_lines.add(line)
            tokenized_sentences.append(tokens)
            total_tokens += len(tokens)
            vocabulary_set.update(tokens)

    if not tokenized_sentences:
        raise ValueError(f"Derlem dosyasında geçerli bir cümle bulunamadı: {corpus_path}")

    stats = {
        "raw_lines_count": total_raw_lines,
        "clean_sentences_count": len(tokenized_sentences),
        "total_tokens_count": total_tokens,
        "unique_words_count": len(vocabulary_set)
    }

    return tokenized_sentences, stats


def evaluate_model_on_benchmark(model: Word2Vec, benchmark_path: str = DEFAULT_EVAL_PATH) -> Dict[str, Any]:
    """
    Eğitilmiş Word2Vec modelini referans Türkçe kelime çiftleri test kümesi üzerinde ölçer.
    Yüksek, orta ve ilişkisiz kelime çiftlerinin ortalama kosinüs benzerliğini hesaplar.
    """
    if not os.path.exists(benchmark_path):
        return {
            "status": "benchmark_file_not_found",
            "message": "Referans değerlendirme veri seti dosyası bulunamadı."
        }

    with open(benchmark_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    pairs = data.get("pairs", [])
    high_sims: List[float] = []
    medium_sims: List[float] = []
    low_sims: List[float] = []
    evaluated_pairs_details = []

    for item in pairs:
        w1 = item["word1"]
        w2 = item["word2"]
        tier = item.get("expected_tier", "medium")

        if w1 in model.wv and w2 in model.wv:
            sim = float(model.wv.similarity(w1, w2))
            evaluated_pairs_details.append({
                "pair": f"{w1} - {w2}",
                "similarity": round(sim, 4),
                "tier": tier,
                "category": item.get("category", "")
            })
            if tier == "high":
                high_sims.append(sim)
            elif tier == "medium":
                medium_sims.append(sim)
            else:
                low_sims.append(sim)

    avg_high = float(np.mean(high_sims)) if high_sims else 0.0
    avg_med = float(np.mean(medium_sims)) if medium_sims else 0.0
    avg_low = float(np.mean(low_sims)) if low_sims else 0.0

    # Ayrım Gücü (Discrimination Margin): Yüksek benzerlik ile ilişkisizler arasındaki fark
    margin = round(avg_high - avg_low, 4)
    # Model başarısı: Yüksek çiftlerin benzerliği ilişkisizlerden belirgin şekilde yüksek mi?
    is_sound = avg_high > avg_low and margin > 0.0

    return {
        "status": "evaluated",
        "benchmark_name": data.get("benchmark_name", "LexiMind-TR-Eval"),
        "total_test_pairs": len(pairs),
        "evaluated_test_pairs": len(evaluated_pairs_details),
        "avg_similarity_high_tier": round(avg_high, 4),
        "avg_similarity_medium_tier": round(avg_med, 4),
        "avg_similarity_low_tier": round(avg_low, 4),
        "discrimination_margin": margin,
        "is_theoretically_sound": is_sound,
        "interpretation": (
            f"Model beklenen semantik hiyerarşiyi doğrulamıştır: Yüksek benzerlikli çiftler (ort. {round(avg_high, 3)}), "
            f"ilişkisiz çiftlere göre (ort. {round(avg_low, 3)}) pozitif ayrım marjıyla (+{margin}) daha yakın temsil edilmiştir."
            if is_sound else
            "Derlem boyutu veya kelime sıklığı nedeniyle bazı test çiftlerinde sınırlı ayrım tespit edildi."
        ),
        "samples": evaluated_pairs_details[:8]
    }


def compute_corpus_statistics(corpus_path: str = DEFAULT_CORPUS_PATH) -> Dict[str, Any]:
    """
    Derlem hakkında kapsamlı metrikler üretir:
    Toplam satır, temiz cümle, belirteç (token) sayısı, benzersiz kelime dağarcığı,
    Type-Token Ratio (TTR), en sık geçen kelimeler ve örnek cümleler.
    """
    sentences, stats = load_and_clean_corpus(corpus_path)
    from collections import Counter
    
    all_tokens = [tok for sent in sentences for tok in sent]
    counter = Counter(all_tokens)
    top_words = [
        {
            "word": w,
            "count": c,
            "frequency_percentage": round((c / len(all_tokens)) * 100, 2)
        }
        for w, c in counter.most_common(30)
    ]
    
    avg_sentence_len = round(len(all_tokens) / len(sentences), 2) if sentences else 0
    ttr = round(stats["unique_words_count"] / stats["total_tokens_count"], 4) if stats["total_tokens_count"] else 0

    return {
        "status": "ready",
        "corpus_name": "LexiMind Turkish Semantic Corpus (Genişletilmiş Türkçe Derlem)",
        "source_description": "Türkçe bilim, teknoloji, felsefe, sanat, hukuk, doğa ve toplumsal literatür derlemi",
        "raw_lines_count": stats["raw_lines_count"],
        "clean_sentences_count": stats["clean_sentences_count"],
        "total_tokens_count": stats["total_tokens_count"],
        "unique_words_count": stats["unique_words_count"],
        "type_token_ratio": ttr,
        "average_sentence_length_tokens": avg_sentence_len,
        "top_frequent_words": top_words,
        "sample_sentences": [" ".join(s) for s in sentences[:8]],
        "linguistic_note": (
            "Frekans analizi (Zipf Yasası) kelimelerin metindeki salt kullanım sıklığını gösterir. "
            "Word2Vec ise bu sıklıkları değil, kelimelerin çevresindeki bağlamsal dağılımını (Distributional Hypothesis) "
            "öğrenerek semantik vektörlere dönüştürür."
        )
    }


def train_word2vec_model(
    corpus_path: str = DEFAULT_CORPUS_PATH,
    model_save_path: str = DEFAULT_MODEL_PATH,
    params: Dict[str, Any] = None,
    custom_sentences: List[List[str]] = None
) -> Dict[str, Any]:
    """
    Türkçe derlem veya kullanıcı tarafından sağlanan özel cümleler üzerinde
    Word2Vec (Skip-gram veya CBOW) modelini eğitir, performansı değerlendirir ve modeli kaydeder.
    """
    active_params = DEFAULT_TRAINING_PARAMS.copy()
    if params:
        active_params.update(params)

    start_time = time.time()

    # 1. Cümleleri hazırla
    if custom_sentences and len(custom_sentences) >= 2:
        sentences = custom_sentences
        all_tokens = [tok for s in sentences for tok in s]
        corpus_stats = {
            "raw_lines_count": len(custom_sentences),
            "clean_sentences_count": len(custom_sentences),
            "total_tokens_count": len(all_tokens),
            "unique_words_count": len(set(all_tokens)),
            "source": "custom_user_corpus"
        }
    else:
        sentences, corpus_stats = load_and_clean_corpus(corpus_path)
        corpus_stats["source"] = "default_corpus"

    # 2. Gensim Word2Vec modelini başlat ve eğit
    arch_name = "Skip-gram" if active_params.get("sg", 1) == 1 else "CBOW (Continuous Bag of Words)"
    
    model = Word2Vec(
        sentences=sentences,
        vector_size=active_params["vector_size"],
        window=active_params["window"],
        min_count=active_params["min_count"],
        negative=active_params.get("negative", 5),
        sg=active_params["sg"],
        epochs=active_params["epochs"],
        workers=active_params.get("workers", 2),
        seed=active_params.get("seed", 42),
        compute_loss=active_params.get("compute_loss", True)
    )

    # 3. Modeli diske kaydet
    os.makedirs(os.path.dirname(model_save_path), exist_ok=True)
    model.save(model_save_path)

    training_duration = round(time.time() - start_time, 3)
    vocab_size = len(model.wv.key_to_index)

    # 4. Modeli değerlendir
    eval_results = evaluate_model_on_benchmark(model)

    report = {
        "status": "success",
        "algorithm": f"Word2Vec ({arch_name})",
        "parameters": active_params,
        "corpus_statistics": corpus_stats,
        "vocabulary_size": vocab_size,
        "training_time_seconds": training_duration,
        "saved_path": os.path.abspath(model_save_path),
        "evaluation": eval_results
    }

    return report


if __name__ == "__main__":
    print("[LexiMind] Model eğitimi ve değerlendirme başlatılıyor...")
    res = train_word2vec_model()
    print("[LexiMind] Eğitim başarıyla tamamlandı:")
    print(json.dumps(res, ensure_ascii=False, indent=2))

