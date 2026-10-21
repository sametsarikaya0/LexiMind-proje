"""
LexiMind — Academic Document Parser (app/nlp/document_parser.py)
Extracts and normalizes text from PDF, DOCX, and TXT academic documents.
"""

import io
import re
from typing import Dict, Any, Tuple
from pypdf import PdfReader
import docx

class DocumentParsingError(Exception):
    pass

def parse_pdf_bytes(file_bytes: bytes, filename: str = "belge.pdf") -> Tuple[str, Dict[str, Any]]:
    """
    Extracts text from PDF bytes using pypdf.
    Detects scanned/image-only PDFs and reports meaningful metadata.
    """
    try:
        reader = PdfReader(io.BytesIO(file_bytes))
        num_pages = len(reader.pages)
        if num_pages == 0:
            raise DocumentParsingError("PDF dosyası boş (0 sayfa).")

        page_texts = []
        for i, page in enumerate(reader.pages):
            text = page.extract_text() or ""
            if text.strip():
                page_texts.append(text.strip())

        full_text = "\n\n".join(page_texts).strip()

        if not full_text:
            raise DocumentParsingError(
                "PDF belgesinden metin okunamadı. Belge taranmış resimlerden oluşuyor olabilir (OCR gereklidir). "
                "Lütfen dijital metin katmanı içeren bir PDF veya TXT/DOCX formatında bir dosya yükleyin."
            )

        metadata = {
            "format": "pdf",
            "page_count": num_pages,
            "extracted_pages": len(page_texts),
            "filename": filename
        }
        return full_text, metadata
    except DocumentParsingError:
        raise
    except Exception as e:
        raise DocumentParsingError(f"PDF belgesi işlenirken hata oluştu: {str(e)}")

def parse_docx_bytes(file_bytes: bytes, filename: str = "belge.docx") -> Tuple[str, Dict[str, Any]]:
    """
    Extracts text from DOCX bytes using python-docx.
    Processes paragraphs and table contents.
    """
    try:
        doc = docx.Document(io.BytesIO(file_bytes))
        paragraphs = []

        for p in doc.paragraphs:
            text = p.text.strip()
            if text:
                paragraphs.append(text)

        # Extract table cells if any
        table_texts = []
        for table in doc.tables:
            for row in table.rows:
                row_text = " | ".join(cell.text.strip() for cell in row.cells if cell.text.strip())
                if row_text:
                    table_texts.append(row_text)

        full_text = "\n\n".join(paragraphs)
        if table_texts:
            full_text += "\n\n" + "\n".join(table_texts)

        full_text = full_text.strip()
        if not full_text:
            raise DocumentParsingError("DOCX belgesi metin içermiyor veya boş.")

        metadata = {
            "format": "docx",
            "paragraph_count": len(paragraphs),
            "table_count": len(doc.tables),
            "filename": filename
        }
        return full_text, metadata
    except DocumentParsingError:
        raise
    except Exception as e:
        raise DocumentParsingError(f"DOCX belgesi işlenirken hata oluştu: {str(e)}")

def parse_txt_bytes(file_bytes: bytes, filename: str = "belge.txt") -> Tuple[str, Dict[str, Any]]:
    """
    Decodes plain text bytes trying UTF-8, UTF-16, and Turkish ISO-8859-9/Windows-1254.
    """
    encodings = ["utf-8", "utf-8-sig", "iso-8859-9", "windows-1254", "latin-1"]
    decoded_text = ""
    used_encoding = ""

    for enc in encodings:
        try:
            decoded_text = file_bytes.decode(enc)
            used_encoding = enc
            break
        except UnicodeDecodeError:
            continue

    if not decoded_text:
        raise DocumentParsingError("Metin dosyası desteklenen bir karakter kodlaması (UTF-8 / ISO-8859-9) ile çözülemedi.")

    decoded_text = decoded_text.strip()
    if not decoded_text:
        raise DocumentParsingError("Yüklenen metin dosyası boş.")

    metadata = {
        "format": "txt",
        "encoding": used_encoding,
        "filename": filename
    }
    return decoded_text, metadata

def extract_document_text(file_bytes: bytes, filename: str) -> Tuple[str, Dict[str, Any]]:
    """
    Detects format from filename extension and extracts text.
    """
    ext = ""
    if "." in filename:
        ext = "." + filename.rsplit(".", 1)[-1].lower()

    if ext == ".pdf":
        return parse_pdf_bytes(file_bytes, filename)
    elif ext == ".docx":
        return parse_docx_bytes(file_bytes, filename)
    elif ext in [".txt", ".text", ".md"]:
        return parse_txt_bytes(file_bytes, filename)
    else:
        raise DocumentParsingError(f"Desteklenmeyen dosya uzantısı: '{ext}'. Yalnızca PDF, DOCX ve TXT kabul edilir.")
