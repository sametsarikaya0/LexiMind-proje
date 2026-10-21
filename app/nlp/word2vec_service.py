"""
LexiMind — Word2Vec Service Integration (app/nlp/word2vec_service.py)
Provides semantic similarity, related-word discovery, and educational model metadata
using the trained Gensim Word2Vec model.
"""

from typing import List, Dict, Any, Optional
from nlp.service import nlp_service

def enrich_keywords_with_related_words(
    keywords: List[Dict[str, Any]],
    max_related: int = 4
) -> List[Dict[str, Any]]:
    """
    For each extracted keyword/phrase, queries Gensim Word2Vec for genuine semantic neighbors.
    If the term is a multi-word phrase, queries its primary noun head or component terms.
    If out-of-vocabulary, sets in_model_vocab=False with an honest explanatory status.
    """
    if not nlp_service.is_loaded or nlp_service.model is None:
        for kw in keywords:
            kw["related_words"] = []
            kw["in_model_vocab"] = False
            kw["vocab_status"] = "Model belleğe henüz yüklenmedi."
        return keywords

    for kw in keywords:
        term = kw["term"].strip()
        words_to_try = [term]
        
        # If multi-word phrase, also try individual significant words
        parts = term.split()
        if len(parts) > 1:
            words_to_try.extend(reversed(parts))  # Turkish head words are typically at the end

        found_similar = []
        resolved_term = None
        match_note = None

        for candidate in words_to_try:
            try:
                res = nlp_service.get_similar_words(candidate, top_n=max_related)
                if res.get("found") and res.get("similar_words"):
                    resolved_term = res.get("word")
                    match_note = res.get("resolution_note")
                    found_similar = [
                        {
                            "word": item["word"],
                            "similarity": item["score"],
                            "percentage": item.get("percentage_display", f"{round(item['score']*100, 1)}%")
                        }
                        for item in res["similar_words"]
                        if item["word"] != term and item["word"] != candidate
                    ][:max_related]
                    if found_similar:
                        break
            except Exception:
                continue

        if found_similar:
            kw["related_words"] = found_similar
            kw["in_model_vocab"] = True
            kw["resolved_term"] = resolved_term
            kw["vocab_status"] = "Model sözlüğünde bulundu." + (f" ({match_note})" if match_note else "")
        else:
            kw["related_words"] = []
            kw["in_model_vocab"] = False
            kw["vocab_status"] = "Modelin Türkçe eğitim sözlüğünde yer almıyor (OOV)."

    return keywords

def get_word_similarity(word: str, top_n: int = 10) -> Dict[str, Any]:
    """
    Exposes single-word semantic neighbor exploration for Word Explorer.
    """
    if not nlp_service.is_loaded:
        return {
            "found": False,
            "word": word,
            "message": "Word2Vec modeli henüz yüklenmedi veya hazır değil."
        }
    return nlp_service.get_similar_words(word=word, top_n=top_n)

def get_model_information() -> Dict[str, Any]:
    """
    Returns verified model architecture and parameters directly from Gensim model object.
    """
    return nlp_service.get_model_metadata()
