"""
LexiMind — FastAPI ve NLP Birim / Entegrasyon Testleri

Pytest ve FastAPI TestClient kullanarak tüm zorunlu senaryoları doğrular:
1. Health endpoint çalışıyor.
2. Model bilgileri doğru dönüyor.
3. Model değerlendirme (benchmark) endpoint çalışıyor.
4. Bilinen kelime için benzer kelimeler listeleniyor.
5. Bilinmeyen kelime için 404 kontrollü yanıtı dönüyor.
6. İki kelime karşılaştırılabiliyor ve kosinüs skoru hesaplanıyor.
7. Boş ve geçersiz girdiler (Pydantic validasyonu) 422 ile reddediliyor.
8. Metin analizi doğru istatistikler ve ortalama metin vektörü döndürüyor.
9. PCA 2D vektör projeksiyonu (SVD) doğru koordinatlar üretiyor.
10. Türkçe karakterler (ç, ğ, ı, ö, ş, ü, İ, I) doğru işleniyor.
11. Semantik ağ grafiği çalışıyor.
"""

import pytest
from fastapi.testclient import TestClient
from main import app
from nlp.preprocessing import turkish_lower, clean_text, tokenize, split_sentences, filter_stopwords

client = TestClient(app)

def test_health_endpoint():
    """Health endpoint 200 durum kodu ve model durumunu döndürmelidir."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "model_loaded" in data


def test_model_info_endpoint():
    """Model-info endpoint mimari ve hiperparametreleri içermelidir."""
    response = client.get("/api/model-info")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ready"
    assert data["algorithm"] == "Word2Vec (Skip-gram)"
    assert data["vector_size"] == 100
    assert data["window"] == 5
    assert data["vocab_size"] > 0
    assert "known_limitations" in data


def test_evaluate_endpoint():
    """Evaluate endpoint Türkçe değerlendirme kıyaslama sonuçlarını dönmelidir."""
    response = client.get("/api/evaluate")
    assert response.status_code == 200
    data = response.json()
    assert "benchmark_name" in data
    assert "total_test_pairs" in data
    assert "avg_similarity_high_tier" in data


def test_vocabulary_endpoint():
    """Vocabulary endpoint sözlükteki kelimeleri listelemelidir."""
    response = client.get("/api/vocabulary?limit=20")
    assert response.status_code == 200
    data = response.json()
    assert data["total_vocabulary_size"] > 0
    assert len(data["words"]) <= 20


def test_similar_words_known():
    """Sözlükte yer alan bir kelime için benzer kelimeler dönmelidir."""
    payload = {"word": "yapay", "top_n": 5}
    response = client.post("/api/similar", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["found"] is True
    assert data["word"] == "yapay"
    assert len(data["similar_words"]) == 5
    scores = [item["score"] for item in data["similar_words"]]
    assert scores == sorted(scores, reverse=True)


def test_similar_words_unknown():
    """Sözlükte olmayan bilinmeyen kelime için 404 ve öneri dönmelidir."""
    payload = {"word": "xyzbilinmeyensozcuk999", "top_n": 5}
    response = client.post("/api/similar", json=payload)
    assert response.status_code == 404
    data = response.json()
    assert data["found"] is False
    assert "bulunamadı" in data["message"]


def test_compare_words_success():
    """İki bilinen kelime karşılaştırılabilmeli ve ham kosinüs benzerliği dönmelidir."""
    payload = {"word1": "bilgisayar", "word2": "yazılım"}
    response = client.post("/api/compare", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert isinstance(data["cosine_similarity"], float)
    assert -1.0 <= data["cosine_similarity"] <= 1.0
    assert "relation_level" in data
    assert "academic_disclaimer" in data


def test_compare_words_unknown_fails():
    """Karşılaştırılan kelimelerden biri veya ikisi yoksa 404 dönmelidir."""
    payload = {"word1": "bilgisayar", "word2": "uzayroketi9999"}
    response = client.post("/api/compare", json=payload)
    assert response.status_code == 404
    data = response.json()
    assert data["success"] is False
    assert "uzayroketi9999" in data["missing_words"]


def test_invalid_empty_input_rejected():
    """Boş string veya eksik parametre 422 Unprocessable Entity dönmelidir."""
    response = client.post("/api/similar", json={"word": "", "top_n": 5})
    assert response.status_code == 422

    response2 = client.post("/api/compare", json={"word1": ""})
    assert response2.status_code == 422

    response3 = client.post("/api/analyze", json={"text": ""})
    assert response3.status_code == 422


def test_analyze_text_statistics_and_vector():
    """Metin analizi karakter, kelime, frekans ve ortalama metin vektörünü doğru hesaplamalıdır."""
    sample_text = "Yapay zeka ve derin öğrenme geleceğin teknolojileridir. Yapay zeka sistemleri veri ile öğrenir."
    response = client.post("/api/analyze", json={"text": sample_text})
    assert response.status_code == 200
    data = response.json()
    assert data["total_characters"] == len(sample_text)
    assert data["total_words"] > 5
    assert data["unique_words"] > 3
    assert len(data["top_words"]) > 0
    assert "vocabulary_coverage_percent" in data
    assert "total_sentences" in data
    assert data["total_sentences"] >= 2
    assert "text_vector_norm" in data


def test_vector_projection_pca():
    """2D PCA Projeksiyonu kelimeler için 2 boyutlu koordinatlar üretmelidir."""
    payload = {"center_word": "bilgisayar", "top_n": 8}
    response = client.post("/api/vector-projection", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["dimension"] == 2
    assert data["method"].startswith("PCA")
    assert len(data["points"]) >= 8
    first_pt = data["points"][0]
    assert "x" in first_pt and "y" in first_pt
    assert "word" in first_pt


def test_turkish_character_processing():
    """Türkçe İ ve I harfleri doğru normalize edilmelidir."""
    assert turkish_lower("İSTANBUL") == "istanbul"
    assert turkish_lower("IĞDIR") == "ığdır"
    assert turkish_lower("AĞAÇ VE ÇİÇEK") == "ağaç ve çiçek"
    
    tokens = tokenize("Şemsiye, Çağlayan ve Ördek!")
    assert "şemsiye" in tokens
    assert "çağlayan" in tokens
    assert "ördek" in tokens

    sentences = split_sentences("Birinci cümle. İkinci cümle! Üçüncü cümle?")
    assert len(sentences) == 3

    filtered = filter_stopwords(["yapay", "ve", "zeka", "için"])
    assert "ve" not in filtered
    assert "için" not in filtered
    assert "yapay" in filtered


def test_network_graph_endpoint():
    """Ağ grafiği düğüm ve bağlantı listesini döndürmelidir."""
    response = client.get("/api/network?word=bilgisayar&top_n=5")
    assert response.status_code == 200
    data = response.json()
    assert data["center_word"] == "bilgisayar"
    assert len(data["nodes"]) >= 6
    assert len(data["links"]) >= 5


def test_analogy_endpoint_known():
    """Word2Vec vektör analojisi pozitif ve negatif kelimelerle çalışmalıdır."""
    payload = {"positive": ["bilgisayar", "yazılım"], "negative": ["algoritma"], "top_n": 3}
    response = client.post("/api/analogy", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "equation" in data
    assert len(data["results"]) <= 3
    assert "scientific_explanation" in data


def test_analogy_endpoint_unknown_fails():
    """Sözlükte bulunmayan analoji kelimesi 404 döndürmelidir."""
    payload = {"positive": ["bilgisayar", "uydurmakelime999"]}
    response = client.post("/api/analogy", json=payload)
    assert response.status_code == 404
    data = response.json()
    assert data["success"] is False
    assert "uydurmakelime999" in data["missing_words"]


def test_corpus_statistics_endpoint():
    """Derlem istatistikleri toplam satır, cümle, token ve frekans listesini dönmelidir."""
    response = client.get("/api/corpus/statistics")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ready"
    assert data["clean_sentences_count"] > 0
    assert data["total_tokens_count"] > 0
    assert data["unique_words_count"] > 0
    assert "top_frequent_words" in data
    assert len(data["top_frequent_words"]) > 0
    assert "type_token_ratio" in data


def test_model_metadata_endpoint():
    """Kapsamlı model metaverisi çerçeve sürümleri ve metrikleri içermelidir."""
    response = client.get("/api/model/metadata")
    assert response.status_code == 200
    data = response.json()
    assert "framework_versions" in data
    assert "gensim" in data["framework_versions"]
    assert "similarity_metric" in data


def test_train_model_endpoint():
    """Hiperparametre laboratuvarı parametreleri doğrulamalı ve küçük bir derlemle eğitebilmelidir."""
    # Pydantic validasyon testi: geçersiz epochs (ge=2)
    bad_res = client.post("/api/model/train", json={"epochs": 1})
    assert bad_res.status_code == 422

    # Gerçek eğitim testi: özel metinle
    train_payload = {
        "vector_size": 20,
        "window": 3,
        "min_count": 1,
        "epochs": 5,
        "sg": 1,
        "custom_text": "Yapay zeka modelleri metinleri analiz eder. Doğal dil işleme ve veri madenciliği önemli alanlardır."
    }
    good_res = client.post("/api/model/train", json=train_payload)
    assert good_res.status_code == 200
    train_data = good_res.json()
    assert train_data["status"] == "success"
    assert train_data["vocabulary_size"] > 0
    
    # Modelin tekrar varsayılan derlemle eğitilerek tam kapasiteye dönmesi
    restore_res = client.post("/api/model/train", json={"epochs": 10, "vector_size": 100})
    assert restore_res.status_code == 200

