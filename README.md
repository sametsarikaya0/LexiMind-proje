# LexiMind — Turkish Semantic Intelligence Lab 🧠

> **Word2Vec (Skip-gram & CBOW) Tabanlı Türkçe Doğal Dil İşleme, Kelime Vektörü, PCA 2D İzdüşüm, Analoji Aritmetiği ve Semantik Analiz Platformu**  
> *Üniversite Doğal Dil İşleme (NLP) Dersi Kapsamlı Projesi ve Akademik Raporu*

---

## 📑 İçindekiler
1. [Projenin Amacı ve Kapsamı](#1-projenin-amacı-ve-kapsamı)
2. [Doğal Dil İşleme (NLP) ve Dağılımsal Hipotez](#2-doğal-dil-işleme-nlp-ve-dağılımsal-hipotez)
3. [Word2Vec Teorisi: Skip-gram vs. CBOW](#3-word2vec-teorisi-skip-gram-vs-cbow)
4. [Vektör Geometrisi: Kosinüs Benzerliği ve Analoji Aritmetiği](#4-vektör-geometrisi-kosinüs-benzerliği-ve-analoji-aritmetiği)
5. [Türkçe Dil Ön İşleme Hattı](#5-türkçe-dil-ön-işleme-hattı)
6. [Yazılım Mimarisi (Full-Stack Mimari)](#6-yazılım-mimarisi-full-stack-mimari)
7. [Özellikler ve Laboratuvar Modülleri](#7-özellikler-ve-laboratuvar-modülleri)
8. [API Uç Noktaları](#8-api-uç-noktaları)
9. [Test Metodolojisi ve Pytest Sonuçları (18/18 Geçti)](#9-test-metodolojisi-ve-pytest-sonuçları-1818-geçti)
10. [Model Değerlendirme Benchmark'ı (LexiMind-TR-Eval)](#10-model-değerlendirme-benchmarkı-leximind-tr-eval)
11. [Kurulum ve Yerel Çalıştırma Rehberi](#11-kurulum-ve-yerel-çalıştırma-rehberi)
12. [Dağıtım Rehberi (Vercel & Bağımsız Python Backend)](#12-dağıtım-rehberi-vercel--bağımsız-python-backend)
13. [Akademik Sınırlılıklar ve Etik](#13-akademik-sınırlılıklar-ve-etik)
14. [Doğrulanabilir Bilimsel Kaynakça (References)](#14-doğrulanabilir-bilimsel-kaynakça-references)

---

## 1. Projenin Amacı ve Kapsamı
**LexiMind**, Türkçe dilinde kelimelerin anlamsal temsillerini öğrenmek, vektör uzayında geometrik ilişkilerini incelemek ve metin analizi yapmak üzere geliştirilmiş gerçek ve eksiksiz bir NLP platformudur.

Projede hazır harici yapay zekâ sohbet API'ları (Gemini, OpenAI vb.) yerine, doğrudan matematiksel temelleriyle çalışan **Gensim 4.4 Word2Vec** kütüphanesi, **FastAPI** web servisi ve **React 19 / TypeScript** kullanıcı arayüzü kullanılmıştır.

---

## 2. Doğal Dil İşleme (NLP) ve Dağılımsal Hipotez
Geleneksel yöntemler (One-Hot Encoding, TF-IDF), kelimeleri birbirine dik (ortogonal) ve anlamdan yoksun ayrık semboller olarak görür:
- **TF-IDF:** Kelimeleri $V$ boyutlu seyrek (sparse) vektörlerle modeller. İki kelimenin semantik eşdeğerliğini veya tematik yakınlığını hesaplayamaz.
- **Dağılımsal Hipotez (Firth, 1957; Harris, 1954):** *"Bir kelimeyi arkadaşlık ettiği çevre kelimelerinden tanırsınız."* Word2Vec, kelimelerin bağlamsal dağılımını öğrenerek her kelimeye $d=100$ boyutlu yoğun (dense) bir gömme (embedding) vektörü atar.

---

## 3. Word2Vec Teorisi: Skip-gram vs. CBOW

### Skip-gram Algoritması (`sg=1`, Varsayılan Model):
Merkez kelimeden $w_t$, bağlam penceresindeki $w_{t+j}$ çevre kelimelerini tahmin eder:
$$\mathcal{L} = \sum_{t=1}^{T} \sum_{-c \le j \le c, j \ne 0} \log P(w_{t+j} \mid w_t)$$

Koşullu olasılık **Negatif Örnekleme (Negative Sampling, $k=5$)** ile hesaplanır:
$$P(w_O \mid w_I) \approx \log \sigma({v'_{w_O}}^\top v_{w_I}) + \sum_{i=1}^{k} \mathbb{E}_{w_i \sim P_n(w)} [\log \sigma(-{v'_{w_i}}^\top v_{w_I})]$$

Küçük ve orta ölçekli derlemlerde ve nadir sözcüklerde CBOW'a göre daha yüksek temsil gücü sunar.

### CBOW (Continuous Bag of Words, `sg=0`):
Çevre kelimelerin vektör ortalamasından merkez kelimeyi tahmin eder. Büyük derlemlerde daha hızlı yakınsar. Projedeki **Model Eğitimi** modülü üzerinden kullanıcı her iki mimariyi de gerçek zamanlı karşılaştırabilir.

---

## 4. Vektör Geometrisi: Kosinüs Benzerliği ve Analoji Aritmetiği

### Kosinüs Benzerliği:
İki kelime vektörü $\vec{u}$ ve $\vec{v}$ arasındaki açısal yönelimi ölçer:
$$\text{cos}(\theta) = \frac{\vec{u} \cdot \vec{v}}{\|\vec{u}\| \|\vec{v}\|} = \frac{\sum_{i=1}^{d} u_i v_i}{\sqrt{\sum_{i=1}^{d} u_i^2} \sqrt{\sum_{i=1}^{d} v_i^2}} \in [-1.0, 1.0]$$
Negatif skorlar yapay olarak filtrelenmez; vektörlerin zıt kutupluluğunu gösterir.

### Vektör Analoji Aritmetiği:
$$\vec{v}_{\text{hedef}} \approx (\vec{v}_A - \vec{v}_B) + \vec{v}_C$$
Örnek: `bilgisayar - donanım + yazılım ≈ algoritma`  
Gensim'in `most_similar(positive=[...], negative=[...])` metodu ile gerçek zamanlı hesaplanır.

### 2D PCA Projeksiyonu (SVD):
100 boyutlu gömme vektörleri, Tekil Değer Ayrışımı (Singular Value Decomposition) uygulanarak varyansı en yüksek ilk 2 temel bileşene indirgenir.

---

## 5. Türkçe Dil Ön İşleme Hattı
1. **Unicode & Harf Normalizasyonu:** Türkçe `İ` $\to$ `i` ve `I` $\to$ `ı` dönüşümleri özel harita ile hatasız işletilir.
2. **Noktalama & Regex Belirteçleme:** `\b\w+\b` regex kalıbı ile kelimeler ayrıştırılır.
3. **Cümle Segmentasyonu:** Nokta, ünlem ve soru işaretleri ile cümle sınırları belirlenir.
4. **Deduplication:** Tekrarlanan ve anlamsız satırlar elenerek derlem temizlenir.
5. **Seçici Stop-word:** Model eğitiminde cümle akışı korunur; metin frekans özetlerinde opsiyonel filtrelenir.

---

## 6. Yazılım Mimarisi (Full-Stack Mimari)

```text
[ React 19 + TypeScript + Tailwind CSS Frontend ]
                        │
                        ▼ (HTTP JSON)
    [ Express API Proxy / Vite Server (Port 3000) ]
                        │
                        ▼ (Proxy Forwarding)
    [ Python 3.11 + FastAPI + Uvicorn (Port 8001) ]
                        │
            ┌───────────┴───────────┐
            ▼                       ▼
    [ nlp/service.py ]      [ nlp/train.py ]
    (Singleton Word2Vec)    (Gensim Training)
            │                       │
            ▼                       ▼
   [ models/word2vec_tr.model ]  [ data/corpus.txt ]
```

---

## 7. Özellikler ve Laboratuvar Modülleri

1. **Benzer Kelimeler Laboratuvarı:** Belirtilen kelimenin Word2Vec uzayındaki en yakın komşularını kosinüs skoruyla listeler.
2. **Kelime Karşılaştırma:** İki kelimenin kosinüs benzerliği ve Öklid mesafesini hesaplar.
3. **Analoji & Aritmetik Gezgini:** Vektör toplama ve çıkarma ile analojileri çözer ($v_A - v_B + v_C$).
4. **2D Vektör İzdüşümü (PCA):** 100 boyutlu vektör uzayını interaktif 2D saçılım grafiğinde görselleştirir.
5. **Semantik İlişki Ağı:** Düğüm ve kenar ağırlıklarıyla kosinüs benzerliği grafiği oluşturur.
6. **Metin Analiz Laboratuvarı:** Metnin kelime frekansını, sözlük kapsama oranını ve ortalama metin embedding vektörünü çıkarır.
7. **Derlem Gezgini:** Derlemdeki token hacmini, Type-Token oranını (TTR) ve Zipf frekans dağılımını gösterir.
8. **Model Eğitimi:** Parametreleri (`vector_size`, `window`, `min_count`, `sg`, `negative`, `epochs`, `seed`) değiştirerek modeli canlı olarak yeniden eğitir.
9. **Sözlük Gezgini:** Model sözlüğünde arama ve filtreleme yapar.
10. **Ödev Raporu & Bilimsel Metodoloji:** Üniversite teslim metnini ve teorik literatür raporunu sunar.

---

## 8. API Uç Noktaları

| Yöntem | Uç Nokta | Açıklama |
|---|---|---|
| `GET` | `/health` veya `/api/health` | Sunucu ve model sağlık durumu |
| `GET` | `/api/model/status` veya `/api/model-info` | Model parametreleri ve sözlük boyutu |
| `GET` | `/api/model/metadata` | Kapsamlı model ve çerçeve metaverisi |
| `GET` | `/api/evaluate` | LexiMind-TR-Eval kıyaslama raporu |
| `GET` | `/api/vocabulary` | Sözlükteki kelimeleri listeleme ve arama |
| `GET` | `/api/corpus/statistics` | Derlem istatistikleri ve kelime frekansları |
| `POST` | `/api/similarity` veya `/api/similar` | En yakın benzer kelimeleri bulma |
| `POST` | `/api/compare` | İki kelimeyi kosinüs ve Öklid ile karşılaştırma |
| `POST` | `/api/analogy` | Vektör aritmetiği ile kelime analojisi |
| `POST` | `/api/analyze` | Metin analizi ve ortalama metin vektörü |
| `POST` | `/api/vector-projection` | 2D PCA vektör projeksiyonu |
| `GET` | `/api/network` | Semantik ağ düğüm ve kenarları |
| `POST` | `/api/model/train` | Özel parametrelerle modeli yeniden eğitme |

---

## 9. Test Metodolojisi ve Pytest Sonuçları (18/18 Geçti)

Automated test suite `tests/test_api.py` altında **18 adet** birim ve entegrasyon testi içermektedir:

```bash
pytest -v
```

Sonuçlar:
- `test_health_endpoint`: **PASSED** (200 OK ve status: healthy)
- `test_model_info_endpoint`: **PASSED** (Hiperparametreler ve sınırlılıklar)
- `test_evaluate_endpoint`: **PASSED** (Değerlendirme metrikleri)
- `test_vocabulary_endpoint`: **PASSED** (Sözlük listeleme)
- `test_similar_words_known`: **PASSED** (Bilinen kelime kosinüs sıralaması)
- `test_similar_words_unknown`: **PASSED** (Bilinmeyen kelimede 404 ve öneri)
- `test_compare_words_success`: **PASSED** (Kosinüs ve Öklid hesabı)
- `test_compare_words_unknown_fails`: **PASSED** (Eksik kelimede kontrollü 404)
- `test_invalid_empty_input_rejected`: **PASSED** (Pydantic 422 doğrulaması)
- `test_analyze_text_statistics_and_vector`: **PASSED** (Ortalama metin vektörü)
- `test_vector_projection_pca`: **PASSED** (SVD 2D koordinat üretimi)
- `test_turkish_character_processing`: **PASSED** (İ/ı ve Türkçe karakter koruması)
- `test_network_graph_endpoint`: **PASSED** (Düğüm ve kenar yapısı)
- `test_analogy_endpoint_known`: **PASSED** (Vektör analojisi hesaplaması)
- `test_analogy_endpoint_unknown_fails`: **PASSED** (Bilinmeyen analoji kelimesinde 404)
- `test_corpus_statistics_endpoint`: **PASSED** (TTR, satır, token istatistikleri)
- `test_model_metadata_endpoint`: **PASSED** (Gensim, NumPy sürümleri)
- `test_train_model_endpoint`: **PASSED** (Model yeniden eğitimi ve validasyon)

---

## 10. Model Değerlendirme Benchmark'ı (LexiMind-TR-Eval)
`data/evaluation_set.json` içerisindeki referans Türkçe kelime çiftleri üzerinde modelin ayrım gücü test edilir:
- **Yüksek Benzerlik Çiftleri:** (Örn: `doktor - hekim`, `yapay - zeka`, `bilgisayar - yazılım`)
- **İlişkisiz Çiftler:** (Örn: `para - şiir`, `doktor - coğrafya`)
Modelin yüksek çiftlere atadığı benzerlik ortalaması ile ilişkisiz çiftler arasındaki fark (discrimination margin) pozitif ve belirgindir ($>0.20$).

---

## 11. Kurulum ve Yerel Çalıştırma Rehberi

### Ön Koşullar:
- Python 3.10+ (Önerilen: 3.11)
- Node.js 18+ ve npm

### Adım 1: Python Bağımlılıkları ve Model Eğitimi
```bash
# Sanal ortam oluşturma
python3 -m venv venv
source venv/bin/activate  # Windows için: .\venv\Scripts\Activate.ps1

# Bağımlılıkları yükleme
pip install -r requirements.txt

# Modeli eğitme
python3 nlp/train.py

# Testleri çalıştırma
pytest -v
```

### Adım 2: Web Arayüzü ve Full-Stack Sunucu
```bash
npm install
npm run dev
```
- Tarayıcıdan açınız: `http://localhost:3000`
- FastAPI Swagger belgeleri: `http://localhost:3000/docs`

---

## 12. Dağıtım Rehberi (Vercel & Bağımsız Python Backend)

### Mimari Kararı:
Word2Vec modelleri diskten model dosyası okur ve bellek içi C-uzantılı matris işlemleri yapar. Vercel Serverless Functions ortamında bellek kısıtları (50MB lambda paketi) ve soğuk başlatma (cold start) süreleri nedeniyle kalıcı Python modelleri için önerilen pratik mimari:
1. **Frontend:** Vercel üzerinde hızlı ve statik olarak barındırılır (`npm run build`).
2. **Backend:** Python FastAPI servisi bağımsız bir Python konteynerinde (Render, Railway, Fly.io veya Cloud Run) çalıştırılır.
3. **Entegrasyon:** Frontend'de `VITE_API_BASE_URL` ortam değişkeni canlı backend adresine yönlendirilir.

Alternatif olarak, küçük derlemli tekil Vercel dağıtımları için `vercel.json` yapılandırması projede hazırdır.

---

## 13. Akademik Sınırlılıklar ve Etik
1. **Statik Vektör Kısıtı:** Word2Vec kelime başına tek bir statik vektör atar. Bu nedenle eş sesli (homonim) kelimeler (ör. *yüz* = sayı vs. surat) tek vektörde birleşir. Bağlamsal transformer modelleri (BERT) bu kısıtı çözer.
2. **Derlem Büyüklüğü:** Sağlanan derlem akademik laboratuvar amaçlıdır; genel amaçlı bir Türkçe LLM modeli iddiası taşımaz.
3. **Algoritmik Önyargı (Bias):** Model doğrudan derlemdeki kelime eş-oluşumlarını yansıttığından, derlemdeki toplumsal cinsiyet veya kültürel kalıplar vektör uzayına yansır.

---

## 14. Doğrulanabilir Bilimsel Kaynakça (References)

1. **Mikolov, T., Chen, K., Corrado, G., & Dean, J. (2013a).** Efficient estimation of word representations in vector space. *arXiv preprint arXiv:1301.3781*.
2. **Mikolov, T., Sutskever, I., Chen, K., Corrado, G. S., & Dean, J. (2013b).** Distributed representations of words and phrases and their compositionality. *Advances in Neural Information Processing Systems (NeurIPS 2013)*, 26.
3. **Řehůřek, R., & Sojka, P. (2010).** Software Framework for Topic Modelling with Large Corpora. *In Proceedings of the LREC 2010 Workshop on New Challenges for NLP Frameworks*, pp. 45–50.
4. **Firth, J. R. (1957).** A synopsis of linguistic theory, 1930-1955. *Studies in Linguistic Analysis*, Philological Society, Oxford.
5. **Harris, Z. S. (1954).** Distributional structure. *Word*, 10(2-3), 146-162.
6. **Pennington, J., Socher, R., & Manning, C. D. (2014).** GloVe: Global Vectors for Word Representation. *In Proceedings of EMNLP 2014*, pp. 1532–1543.
