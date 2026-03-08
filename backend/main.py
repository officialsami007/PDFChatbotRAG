from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import uuid
import os

from rag.parser import extract_text_from_pdf, chunk_text
from rag.vectorstore import store_chunks, delete_session
from rag.chain import get_answer, clear_memory

load_dotenv()

app = FastAPI(title="PDF RAG Chatbot", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict to your Vercel URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request/Response Models ──────────────────────────────────────────────────

class QuestionRequest(BaseModel):
    session_id: str
    question: str

class QuestionResponse(BaseModel):
    answer: str
    chunks_used: int

class UploadResponse(BaseModel):
    session_id: str
    chunks_stored: int
    message: str


# ── Routes ───────────────────────────────────────────────────────────────────

@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "PDF RAG Chatbot is running"}


@app.post("/upload", response_model=UploadResponse)
async def upload_pdf(file: UploadFile = File(...)):
    """
    Upload a PDF. Extracts text, chunks it, embeds it via LangChain, and stores in ChromaDB.
    Returns a session_id for all subsequent questions.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    file_bytes = await file.read()
    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    # Step 1: Extract text
    try:
        text = extract_text_from_pdf(file_bytes)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse PDF: {str(e)}")

    if not text.strip():
        raise HTTPException(status_code=400, detail="Could not extract any text. PDF may be image-based.")

    # Step 2: Chunk text
    chunks = chunk_text(text, chunk_size=800, overlap=100)
    if not chunks:
        raise HTTPException(status_code=400, detail="PDF has no readable content.")

    # Step 3: Embed + store via LangChain (embedder is called inside store_chunks)
    session_id = str(uuid.uuid4())
    try:
        store_chunks(session_id, chunks)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Vector store failed: {str(e)}")

    return UploadResponse(
        session_id=session_id,
        chunks_stored=len(chunks),
        message=f"'{file.filename}' processed successfully. You can now ask questions."
    )


@app.post("/ask", response_model=QuestionResponse)
async def ask_question(req: QuestionRequest):
    """
    Ask a question about the uploaded PDF.
    LangChain handles retrieval + memory + generation internally.
    """
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    try:
        answer, chunks_used = get_answer(req.session_id, req.question)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chain error: {str(e)}")

    return QuestionResponse(answer=answer, chunks_used=chunks_used)


@app.delete("/session/{session_id}")
async def end_session(session_id: str):
    """Clean up vector data and conversation memory for a session."""
    delete_session(session_id)
    clear_memory(session_id)
    return {"message": "Session ended and data cleared."}