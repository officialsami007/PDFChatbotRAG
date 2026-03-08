from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import uuid
import os

from rag.parser import extract_text_from_pdf, chunk_text
from rag.embedder import embed_texts, embed_query
from rag.vectorstore import store_chunks, retrieve_chunks, delete_session
from rag.chain import get_answer, clear_memory

load_dotenv()

app = FastAPI(title="PDF RAG Chatbot", version="1.0.0")

# Allow requests from the React frontend (localhost:5173 for dev, and your Vercel domain for prod)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict this to your Vercel URL in production
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
    """Simple health check endpoint."""
    return {"status": "ok", "message": "PDF RAG Chatbot is running"}


@app.post("/upload", response_model=UploadResponse)
async def upload_pdf(file: UploadFile = File(...)):
    """
    Upload a PDF file. Extracts text, chunks it, embeds it, and stores in ChromaDB.
    Returns a session_id to use for all questions about this PDF.
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
        raise HTTPException(status_code=400, detail="Could not extract any text from this PDF. It may be image-based (scanned).")

    # Step 2: Chunk text
    chunks = chunk_text(text, chunk_size=800, overlap=100)
    if not chunks:
        raise HTTPException(status_code=400, detail="PDF has no readable content.")

    # Step 3: Embed chunks (free, local model)
    try:
        embeddings = embed_texts(chunks)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Embedding failed: {str(e)}")

    # Step 4: Store in ChromaDB with a unique session ID
    session_id = str(uuid.uuid4())
    try:
        store_chunks(session_id, chunks, embeddings)
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
    Requires the session_id returned from /upload.
    """
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    # Step 1: Embed the question
    try:
        query_embedding = embed_query(req.question)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Query embedding failed: {str(e)}")

    # Step 2: Retrieve top-5 relevant chunks
    try:
        context_chunks = retrieve_chunks(req.session_id, query_embedding, top_k=5)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Retrieval failed: {str(e)}")

    if not context_chunks:
        raise HTTPException(status_code=404, detail="Session not found. Please upload a PDF first.")

    # Step 3: Generate answer with Groq (free LLM)
    try:
        answer = get_answer(req.session_id, req.question, context_chunks)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM error: {str(e)}")

    return QuestionResponse(answer=answer, chunks_used=len(context_chunks))


@app.delete("/session/{session_id}")
async def end_session(session_id: str):
    """Clean up vector data and conversation memory for a session."""
    delete_session(session_id)
    clear_memory(session_id)
    return {"message": "Session ended and data cleared."}
