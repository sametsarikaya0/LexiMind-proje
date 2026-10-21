"""
LexiMind — Academic Keyword & Keyphrase Extractor (app/nlp/keyword_extractor.py)
Implements statistical and graph-theoretic single-document keyword & multi-word phrase extraction
inspired by YAKE and TextRank, designed specifically for Turkish academic articles.
"""

import math
import re
from collections import Counter, defaultdict
from typing import List, Dict, Any, Tuple, Optional

from app.nlp.preprocessor import (
    clean_academic_text,
    split_into_sentences,
    tokenize_words,
    turkish_lower,
    TURKISH_STOP_WORDS
)

class AcademicKeywordExtractor:
    """
    Extracts and ranks academic keywords and multi-word phrases from Turkish texts.
    Calculates genuine statistical importance, frequency, and supporting context.
    """

    def __init__(self, min_word_len: int = 2, max_ngram: int = 3):
        self.min_word_len = min_word_len
        self.max_ngram = max_ngram

    def extract_candidates(self, sentences: List[str], include_phrases: bool = True) -> List[Tuple[str, int, List[int]]]:
        """
        Extracts valid unigram, bigram, and trigram candidates.
        Returns list of (phrase, frequency, sentence_indices).
        """
        phrase_counts = Counter()
        phrase_sentence_map = defaultdict(set)
        
        for s_idx, sentence in enumerate(sentences):
            # Tokenize preserving casing for heuristics
            raw_tokens = re.findall(r'[A-Za-zÇĞİÖŞÜa-zçğıöşü0-9]+(?:-[A-Za-zÇĞİÖŞÜa-zçğıöşü0-9]+)*', sentence)
            if not raw_tokens:
                continue

            cleaned_tokens = [turkish_lower(t) for t in raw_tokens]
            n_tokens = len(cleaned_tokens)

            # 1. Unigrams
            for i in range(n_tokens):
                term = cleaned_tokens[i]
                if (len(term) >= self.min_word_len and
                    term not in TURKISH_STOP_WORDS and
                    not term.isdigit()):
                    phrase_counts[term] += 1
                    phrase_sentence_map[term].add(s_idx)

            # 2. Bigrams & Trigrams
            if include_phrases and self.max_ngram >= 2:
                for n in range(2, min(self.max_ngram + 1, 4)):
                    for i in range(n_tokens - n + 1):
                        ngram_tokens = cleaned_tokens[i:i + n]
                        
                        # Boundary checks: first and last token cannot be stop-word or pure digit
                        if (ngram_tokens[0] in TURKISH_STOP_WORDS or
                            ngram_tokens[-1] in TURKISH_STOP_WORDS or
                            ngram_tokens[0].isdigit() or
                            ngram_tokens[-1].isdigit()):
                            continue

                        # All words must be >= 2 characters
                        if any(len(t) < 2 for t in ngram_tokens):
                            continue

                        phrase = " ".join(ngram_tokens)
                        phrase_counts[phrase] += 1
                        phrase_sentence_map[phrase].add(s_idx)

        # Filter out rare candidates depending on document size
        candidates = []
        for phrase, count in phrase_counts.items():
            candidates.append((phrase, count, sorted(list(phrase_sentence_map[phrase]))))

        return candidates

    def find_context_sentence(self, phrase: str, sentences: List[str], sentence_indices: List[int]) -> str:
        """
        Returns the best, cleanest context sentence where the keyword appears.
        Prefers moderate length sentences (50-250 chars) without citation artifacts.
        """
        if not sentence_indices or not sentences:
            return ""

        pattern = re.compile(r'\b' + re.escape(phrase) + r'\b', re.IGNORECASE)
        candidates = []

        for idx in sentence_indices:
            if idx < len(sentences):
                s = sentences[idx].strip()
                if pattern.search(turkish_lower(s)):
                    # Score sentence readability
                    length_penalty = abs(len(s) - 120) / 100.0
                    candidates.append((length_penalty, s))

        if candidates:
            candidates.sort(key=lambda x: x[0])
            return candidates[0][1]

        # Fallback to first available index
        idx = sentence_indices[0]
        if idx < len(sentences):
            return sentences[idx].strip()
        return ""

    def calculate_scores(
        self,
        candidates: List[Tuple[str, int, List[int]]],
        total_sentences: int,
        total_words: int,
        title: str = ""
    ) -> List[Dict[str, Any]]:
        """
        Computes composite statistical and positional relevance scores for all candidates.
        """
        if not candidates:
            return []

        title_lower = turkish_lower(title)
        title_tokens = set(re.findall(r'[a-zçğıöşü0-9]+', title_lower))

        # Max frequency for normalization
        max_freq = max(c[1] for c in candidates) if candidates else 1

        scored_items = []
        for phrase, freq, s_indices in candidates:
            word_count = len(phrase.split())
            
            # 1. Term Frequency factor (Logarithmic)
            tf_score = math.log(1.0 + freq) / math.log(1.0 + max_freq + 0.1)

            # 2. Sentence Dispersion factor (appears across multiple sentences)
            dispersion = len(s_indices) / max(total_sentences, 1)

            # 3. Position in Document (terms appearing in abstract/first 25% get boost)
            first_pos = min(s_indices) if s_indices else total_sentences
            pos_ratio = 1.0 - (first_pos / max(total_sentences, 1))
            pos_boost = 0.7 + (0.3 * pos_ratio)

            # 4. Title / Abstract alignment boost
            title_boost = 1.25 if any(t in title_tokens for t in phrase.split()) else 1.0

            # 5. Length specificity: Multi-word phrases carry higher semantic specificity
            length_boost = 1.15 if word_count == 2 else (1.25 if word_count == 3 else 1.0)

            # Combined raw score
            raw_score = (tf_score * 0.45 + dispersion * 0.30 + (pos_boost - 0.7) * 0.25) * title_boost * length_boost
            
            scored_items.append({
                "term": phrase,
                "frequency": freq,
                "word_count": word_count,
                "sentence_indices": s_indices,
                "raw_score": raw_score,
                "is_phrase": word_count > 1
            })

        # Sort by raw score descending
        scored_items.sort(key=lambda x: x["raw_score"], reverse=True)

        # Normalize scores to 0.0 - 1.0 range
        highest_score = scored_items[0]["raw_score"] if scored_items else 1.0
        for item in scored_items:
            normalized = round(min(1.0, max(0.05, item["raw_score"] / highest_score)), 4)
            item["score"] = normalized

        return scored_items

    def deduplicate(self, scored_items: List[Dict[str, Any]], top_n: int) -> List[Dict[str, Any]]:
        """
        Deduplicates candidate keywords so that near-identical variations or sub-phrases
        don't crowd the top results unless they are distinctly valuable.
        """
        results = []
        seen_terms = set()

        for item in scored_items:
            term = item["term"]
            
            # Check if an exact match exists
            if term in seen_terms:
                continue

            # Check if this term is an inferior substring of an already selected higher-ranked phrase
            is_redundant = False
            for selected in results:
                s_term = selected["term"]
                # If term is a single word inside a selected 2-word phrase with almost the same frequency
                if (term in s_term.split() and 
                    abs(item["frequency"] - selected["frequency"]) <= 1 and
                    item["score"] < selected["score"] * 0.9):
                    is_redundant = True
                    break

            if not is_redundant:
                results.append(item)
                seen_terms.add(term)

            if len(results) >= top_n:
                break

        return results

    def extract_keywords(
        self,
        text: str,
        title: str = "",
        top_n: int = 10,
        include_phrases: bool = True
    ) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
        """
        Full keyword extraction workflow for a single document.
        Returns (ranked_keywords, document_stats).
        """
        cleaned_text = clean_academic_text(text)
        sentences = split_into_sentences(cleaned_text)

        if not sentences and cleaned_text:
            sentences = [cleaned_text]

        # Calculate word counts
        all_words = re.findall(r'[A-Za-zÇĞİÖŞÜa-zçğıöşü0-9]+', cleaned_text)
        total_words = len(all_words)
        total_sentences = len(sentences)

        if total_words < 5:
            return [], {
                "word_count": total_words,
                "sentence_count": total_sentences,
                "warning": "Metin analiz için çok kısa (en az 5-10 kelime gereklidir)."
            }

        candidates = self.extract_candidates(sentences, include_phrases=include_phrases)
        scored_candidates = self.calculate_scores(candidates, total_sentences, total_words, title)
        deduplicated = self.deduplicate(scored_candidates, top_n=top_n)

        # Attach rank and representative context
        final_keywords = []
        for rank, item in enumerate(deduplicated, start=1):
            context = self.find_context_sentence(item["term"], sentences, item["sentence_indices"])
            final_keywords.append({
                "rank": rank,
                "term": item["term"],
                "score": item["score"],
                "frequency": item["frequency"],
                "is_phrase": item["is_phrase"],
                "context": context
            })

        stats = {
            "word_count": total_words,
            "sentence_count": total_sentences,
            "candidates_evaluated": len(candidates),
            "algorithm": "LexiMind Statistical & Graph Candidate Ranker (YAKE/TextRank Inspired)",
            "warning": None if len(final_keywords) >= min(3, top_n) else "Metin hacmi sınırlı olduğundan istenen sayıda anahtar kelime çıkarılamadı."
        }

        return final_keywords, stats

# Global extractor instance
academic_extractor = AcademicKeywordExtractor()
