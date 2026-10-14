"""
LexiMind — Turkish Semantic Intelligence Lab (Flask Alternatifi)
app_flask.py

Üniversite NLP dersi kapsamında Flask framework'ünü tercih etmek isteyen öğrenciler
ve Vercel & Flask dağıtımı için hazırlanmış tam uyumlu Flask uygulaması.
Tüm endpoint'ler FastAPI ile birebir aynı JSON yanıt yapısını üretir.

Referans:
- Flask Framework: https://flask.palletsprojects.com/en/stable/
- Vercel & Flask: https://vercel.com/docs/frameworks/backend/flask
"""

import os
import sys
from flask import Flask, request, jsonify

# NLP modüllerini yükle
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
from nlp.service import nlp_service

app = Flask(__name__)

# CORS Desteği
@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    return response


@app.route('/health', methods=['GET'])
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "LexiMind Flask API",
        "model_loaded": nlp_service.is_loaded,
        "framework": "Flask 3.x",
        "environment": os.getenv("ENVIRONMENT", "production")
    })


@app.route('/api/model/status', methods=['GET'])
@app.route('/api/model-info', methods=['GET'])
def get_model_information():
    return jsonify(nlp_service.get_model_info())


@app.route('/api/model/metadata', methods=['GET'])
def get_model_metadata():
    return jsonify(nlp_service.get_model_metadata())


@app.route('/api/evaluate', methods=['GET'])
def evaluate_model():
    try:
        return jsonify(nlp_service.get_evaluation())
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/vocabulary', methods=['GET'])
def get_vocabulary():
    limit = int(request.args.get('limit', 100))
    search = request.args.get('search', '')
    return jsonify(nlp_service.get_vocabulary(limit=limit, search=search))


@app.route('/api/corpus/statistics', methods=['GET'])
def get_corpus_statistics():
    try:
        return jsonify(nlp_service.get_corpus_statistics())
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/similarity', methods=['POST'])
@app.route('/api/similar', methods=['POST'])
def find_similar_words():
    data = request.get_json(silent=True) or {}
    word = data.get('word', '').strip()
    top_n = int(data.get('top_n', 10))

    if not word:
        return jsonify({"detail": "Kelime alanı boş bırakılamaz."}), 422

    try:
        result = nlp_service.get_similar_words(word=word, top_n=top_n)
        status_code = 200 if result.get("found") else 404
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"detail": str(e)}), 500


@app.route('/api/compare', methods=['POST'])
def compare_two_words():
    data = request.get_json(silent=True) or {}
    w1 = data.get('word1', '').strip()
    w2 = data.get('word2', '').strip()

    if not w1 or not w2:
        return jsonify({"detail": "Her iki kelime de girilmelidir."}), 422

    try:
        result = nlp_service.compare_words(word1=w1, word2=w2)
        status_code = 200 if result.get("success") else 404
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"detail": str(e)}), 500


@app.route('/api/analogy', methods=['POST'])
def calculate_analogy():
    data = request.get_json(silent=True) or {}
    positive = data.get('positive', [])
    negative = data.get('negative', [])
    top_n = int(data.get('top_n', 5))

    if not positive:
        return jsonify({"detail": "En az bir pozitif kelime belirtilmelidir."}), 422

    try:
        result = nlp_service.get_analogy(positive=positive, negative=negative, top_n=top_n)
        status_code = 200 if result.get("success") else 404
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"detail": str(e)}), 500


@app.route('/api/analyze', methods=['POST'])
def analyze_text_content():
    data = request.get_json(silent=True) or {}
    text = data.get('text', '').strip()

    if not text:
        return jsonify({"detail": "Analiz edilecek metin boş olamaz."}), 422

    try:
        return jsonify(nlp_service.analyze_text(text=text))
    except Exception as e:
        return jsonify({"detail": str(e)}), 500


@app.route('/api/vector-projection', methods=['POST'])
def project_vectors():
    data = request.get_json(silent=True) or {}
    try:
        return jsonify(nlp_service.project_word_vectors(
            words=data.get('words'),
            center_word=data.get('center_word'),
            top_n=int(data.get('top_n', 12))
        ))
    except Exception as e:
        return jsonify({"detail": str(e)}), 500


@app.route('/api/network', methods=['GET'])
def get_word_network():
    word = request.args.get('word', '').strip()
    top_n = int(request.args.get('top_n', 8))

    if not word:
        return jsonify({"detail": "Merkez kelime belirtilmelidir."}), 422

    try:
        return jsonify(nlp_service.get_network(center_word=word, top_n=top_n))
    except ValueError as ve:
        return jsonify({"detail": str(ve)}), 404
    except Exception as e:
        return jsonify({"detail": str(e)}), 500


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    print(f"[LexiMind Flask] http://127.0.0.1:{port} adresinde çalışıyor...")
    app.run(host='0.0.0.0', port=port, debug=False)
