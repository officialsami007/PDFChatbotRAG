import fitz  # PyMuPDF
from typing import List
from langchain.text_splitter import RecursiveCharacterTextSplitter


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract all text from a PDF given its raw bytes."""
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    full_text = ""
    for page in doc:
        full_text += page.get_text()
    doc.close()
    return full_text


def chunk_text(text: str, chunk_size: int = 800, overlap: int = 100) -> List[str]:
    """
    Split text into overlapping chunks using LangChain's RecursiveCharacterTextSplitter.
    Splits on paragraph → sentence → word boundaries for cleaner chunks than word-count slicing.
    """
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=overlap,
        separators=["\n\n", "\n", ".", " ", ""],
    )
    return splitter.split_text(text)