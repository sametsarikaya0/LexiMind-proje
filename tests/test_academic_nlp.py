"""
LexiMind — Academic NLP & Document Processing Test Suite (tests/test_academic_nlp.py)
Tests keyword extraction, multi-word phrases, document parsers, authentication,
access control, and analysis persistence.
"""

import pytest
import time
from fastapi.testclient import TestClient
from main import app
from app.nlp.keyword_extractor import academic_extractor
from app.nlp.preprocessor import clean_academic_text, split_into_sentences, tokenize_words, turkish_lower
from app.nlp.document_parser import parse_txt_bytes, extract_document_text, DocumentParsingError
from app.core.security import hash_password, verify_password, create_access_token, verify_token

client = TestClient(app)

SAMPLE_ARTICLE = """
Yapay zeka ve derin öğrenme algoritmaları modern bilişim sistemlerinin ve doğal dil işleme uygulamalarının temelini oluşturmaktadır [1, 2]. 
Özellikle büyük veri analitiği ve sinir ağları, karmaşık örüntüleri tanımada yüksek başarı göstermektedir. 
Bu çalışmada, Türkçe akademik metinler üzerinde anahtar kelime çıkarımı ve semantik benzerlik analizi gerçekleştirilmiştir. 
Elde edilen deneysel bulgular, çok kelimeli tamlamaların tekil kelimelere kıyasla daha yüksek anlamsal özgüllük taşıdığını kanıtlamaktadır [Smith et al., 2021].
Sonuç olarak, Word2Vec gömme modelleri ile desteklenen anahtar kelime analizi, araştırmacıların literatür taramasını hızlandırmaktadır.
"""

def test_turkish_preprocessing_and_cleaning():
    cleaned = clean_academic_text(SAMPLE_ARTICLE)
    assert "[1, 2]" not in cleaned
    assert "[Smith et al., 2021]" not in cleaned
    
    # Test Turkish dotted/dotless I conversion
    assert turkish_lower("İSTANBUL IŞIK") == "istanbul ışık"
    
    sentences = split_into_sentences(cleaned)
    assert len(sentences) >= 4
    
    tokens = tokenize_words(sentences[0])
    assert "ve" not in tokens  # Stop word removed
    assert "yapay" in tokens

def test_keyword_and_keyphrase_extraction():
    keywords, stats = academic_extractor.extract_keywords(
        text=SAMPLE_ARTICLE,
        title="Türkçe Akademik Makale Analizi",
        top_n=10,
        include_phrases=True
    )
    assert len(keywords) >= 5
    terms = [kw["term"] for kw in keywords]
    
    # Key domain concepts should be extracted
    assert any("yapay" in t or "öğrenme" in t or "doğal dil" in t or "kelime" in t for t in terms)
    
    # Check keyword structure
    first_kw = keywords[0]
    assert "rank" in first_kw
    assert "term" in first_kw
    assert "score" in first_kw
    assert "frequency" in first_kw
    assert "context" in first_kw
    assert first_kw["score"] <= 1.0 and first_kw["score"] > 0.0
    assert len(first_kw["context"]) > 10

def test_txt_document_parser():
    sample_bytes = "Doğal dil işleme ve makine öğrenmesi uygulamaları.".encode("utf-8")
    text, meta = parse_txt_bytes(sample_bytes, "test.txt")
    assert "Doğal dil işleme" in text
    assert meta["format"] == "txt"

def test_invalid_extension_parser_error():
    with pytest.raises(DocumentParsingError):
        extract_document_text(b"some content", "file.exe")

def test_security_password_hashing():
    pw = "GucluParola123!"
    h = hash_password(pw)
    assert verify_password(pw, h) is True
    assert verify_password("YanlisParola", h) is False

def test_signed_token_lifecycle():
    token = create_access_token(42, "ogrenci@universite.edu.tr")
    verified = verify_token(token)
    assert verified is not None
    user_id, email = verified
    assert user_id == 42
    assert email == "ogrenci@universite.edu.tr"

def test_auth_and_analysis_integration_flow():
    # 1. Register a new academic user
    test_email = f"user_{int(time.time()*1000)}@universite.edu.tr"
    reg_res = client.post("/api/auth/register", json={
        "full_name": "Dr. Ahmet Yılmaz",
        "email": test_email,
        "password": "AkademikParola2026!",
        "terms_accepted": True
    })
    assert reg_res.status_code == 200
    token = reg_res.json()["token"]
    assert token

    headers = {"Authorization": f"Bearer {token}"}

    # 2. Check /api/auth/me
    me_res = client.get("/api/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["email"] == test_email
    assert me_res.json()["full_name"] == "Dr. Ahmet Yılmaz"

    # 3. Perform an academic article analysis
    analyze_res = client.post("/api/analysis", headers=headers, json={
        "title": "Yapay Zeka ve NLP Uygulamaları",
        "text": SAMPLE_ARTICLE,
        "top_n": 8,
        "include_phrases": True,
        "show_related": True,
        "language": "tr"
    })
    assert analyze_res.status_code == 200
    analysis_data = analyze_res.json()
    analysis_id = analysis_data["id"]
    assert analysis_data["word_count"] > 30
    assert len(analysis_data["keywords"]) >= 5
    assert "model_status" in analysis_data

    # 4. Check user analysis list
    history_res = client.get("/api/analysis", headers=headers)
    assert history_res.status_code == 200
    analyses = history_res.json()
    assert len(analyses) >= 1
    assert analyses[0]["id"] == analysis_id

    # 5. Check user stats
    stats_res = client.get("/api/analysis/stats/overview", headers=headers)
    assert stats_res.status_code == 200
    stats = stats_res.json()
    assert stats["total_analyses"] >= 1
    assert stats["total_extracted_keywords"] >= 5

    # 6. Retrieve single analysis
    single_res = client.get(f"/api/analysis/{analysis_id}", headers=headers)
    assert single_res.status_code == 200
    assert single_res.json()["title"] == "Yapay Zeka ve NLP Uygulamaları"

    # 7. Delete analysis
    del_res = client.delete(f"/api/analysis/{analysis_id}", headers=headers)
    assert del_res.status_code == 200
    
    # Verify deletion
    single_res2 = client.get(f"/api/analysis/{analysis_id}", headers=headers)
    assert single_res2.status_code == 404
