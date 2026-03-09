# 📄 PDF RAG Chatbot — AI-Powered Document Q&A

<div align="center">

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![LangChain](https://img.shields.io/badge/LangChain-Framework-1C3C3C?style=for-the-badge)
![ChromaDB](https://img.shields.io/badge/ChromaDB-VectorStore-FF6B6B?style=for-the-badge)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Render](https://img.shields.io/badge/Deployed-Render-46E3B7?style=for-the-badge)

**Upload any PDF and have a real conversation with it. Powered by Retrieval-Augmented Generation (RAG) with a fully free tech stack — no paid APIs, no cloud vector databases.**

[🚀 Live Demo](https://pdf-chatbot-rag-t94b.onrender.com) · [📖 How It Works](#how-it-works) · [⚙️ Local Setup](#local-setup) · [🏗️ Architecture](#architecture)

</div>

---

## Overview

PDF RAG Chatbot is a full-stack AI application that lets users upload any PDF document and ask questions about it in natural language. Rather than sending the entire document to an LLM on every message, the app uses **Retrieval-Augmented Generation (RAG)** — a technique where only the most relevant chunks of the document are retrieved and passed to the model per query.

Embeddings are generated locally using `sentence-transformers`, meaning no external embedding API is ever called. Document vectors are stored and queried using **ChromaDB**, a lightweight local vector database. The RAG chain is built with **LangChain**, with **Groq** as the LLM inference provider. The entire application is containerized with **Docker** for consistent local development and cloud deployment. The result is an end-to-end RAG pipeline with zero infrastructure cost.

---

## Live Demo

🌐 **[https://pdf-chatbot-rag-t94b.onrender.com](https://pdf-chatbot-rag-t94b.onrender.com)**

> Hosted on Render's free tier. If the page takes ~30 seconds to load, the server is waking from sleep — this is expected behaviour on free-tier hosting.

---

## Features

- **PDF Upload & Parsing** — Drag and drop any text-based PDF; the backend parses, chunks, and indexes it automatically
- **Local Embeddings** — Uses `sentence-transformers` to generate embeddings on the server — no external embedding API required
- **Vector Search** — ChromaDB stores and retrieves the most semantically relevant chunks per user query
- **LangChain RAG Chain** — LangChain's `RetrievalQA` chain orchestrates retrieval, prompt construction, and LLM response in one pipeline
- **Conversational Memory** — Chat history is maintained within a session for coherent follow-up questions
- **Free LLM Inference** — Groq API (`llama-3.3-70b`) provides fast, high-quality responses at no cost
- **React Frontend** — Clean two-screen UI: upload screen and a dedicated chat interface
- **REST API Backend** — FastAPI backend with clearly defined endpoints for upload, querying, and health checks
- **Dockerized** — Fully containerized for consistent local development and cloud deployment

---

## How It Works

### The RAG Pipeline

```
User uploads PDF
       │
       ▼
  ┌──────────┐
  │  Parser  │  Extracts raw text from PDF pages
  └────┬─────┘
       │
       ▼
  ┌──────────┐
  │  Chunker │  Splits text into overlapping chunks
  └────┬─────┘
       │
       ▼
  ┌──────────────────────┐
  │ sentence-transformers│  Converts each chunk into a vector embedding (locally)
  └──────────┬───────────┘
             │
             ▼
  ┌──────────────┐
  │   ChromaDB   │  Stores all chunk vectors persistently
  └──────────────┘

User asks a question
       │
       ▼
  ┌──────────────────────┐
  │ sentence-transformers│  Embeds the question into a vector
  └──────────┬───────────┘
             │
             ▼
  ┌──────────────┐
  │   ChromaDB   │  Finds the top-K most similar chunks (semantic search)
  └──────┬───────┘
         │
         ▼
  ┌───────────────────┐
  │ LangChain RetrievalQA │  Combines retrieved chunks + question into a structured prompt
  └──────────┬────────┘
             │
             ▼
  ┌────────────┐
  │ Groq (LLM) │  Generates the final answer
  └─────┬──────┘
        │
        ▼
   Answer returned to user ✓
```

### Key RAG Concepts Applied

| Concept | Implementation |
|---|---|
| **Document Chunking** | `parser.py` — splits PDF text into overlapping chunks for better context coverage |
| **Local Embeddings** | `embedder.py` — `sentence-transformers` runs entirely on the server, no API calls |
| **Vector Store** | `vectorstore.py` — ChromaDB stores and queries embeddings with cosine similarity |
| **Retrieval** | Top-K semantic search retrieves only the most relevant chunks per query |
| **Augmented Generation** | `chain.py` — LangChain's `RetrievalQA` chain combines retrieved chunks with the LLM prompt |
| **Conversational Memory** | LangChain memory module maintains chat history for multi-turn dialogue |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **AI Framework** | LangChain |
| **LLM** | Groq API (`llama-3.3-70b-versatile`) — free tier |
| **Embeddings** | `sentence-transformers` — runs locally, no API cost |
| **Vector Database** | ChromaDB — local, persistent, no cloud required |
| **Backend** | FastAPI, Python 3.10+ |
| **Frontend** | React 18, Vite |
| **PDF Parsing** | PyMuPDF / pdfplumber |
| **Containerization** | Docker |
| **Backend Hosting** | Render (free tier) |
| **Frontend Hosting** | Vercel (free tier) |

**Total monthly cost: $0**

---

## Architecture

```
pdf-rag/
│
├── backend/
│   ├── rag/
│   │   ├── parser.py        # PDF parsing and text chunking
│   │   ├── embedder.py      # Local embeddings via sentence-transformers
│   │   ├── vectorstore.py   # ChromaDB vector storage and retrieval
│   │   └── chain.py         # LangChain RetrievalQA chain + Groq LLM + memory
│   ├── main.py              # FastAPI app — all endpoints defined here
│   ├── Dockerfile           # Container definition for backend
│   ├── requirements.txt
│   └── .env                 # API keys (never committed)
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Upload.jsx   # PDF drag-and-drop upload screen
    │   │   └── Chat.jsx     # Conversational chat interface
    │   ├── App.jsx
    │   ├── api.js           # Axios calls to FastAPI backend
    │   └── index.css
    ├── index.html
    ├── package.json
    └── vite.config.js
```

### API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check — confirms backend is running |
| `POST` | `/upload` | Upload a PDF, triggers parsing + embedding + storage |
| `POST` | `/chat` | Submit a question, returns AI answer with sources |

---

## Local Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- A free [Groq API key](https://console.groq.com) — no credit card required
- [Docker](https://www.docker.com/products/docker-desktop/) (optional — for containerized setup)

### Backend — Run with Python

```bash
# Navigate into the backend folder
cd backend

# Create and activate a virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Add your API key — create backend/.env with:
# GROQ_API_KEY=gsk_your_key_here
# CHROMA_PERSIST_DIR=./chroma_db

# Start the backend
uvicorn main:app --reload --port 8000
```

### Backend — Run with Docker

```bash
cd backend

# Build the image
docker build -t pdf-rag-backend .

# Run the container
docker run -p 8000:8000 --env-file .env pdf-rag-backend
```

Backend runs at **http://localhost:8000** — verify with `/health`.

> **Note:** The first PDF upload will be slower than usual — `sentence-transformers` downloads the embedding model (~80MB) on first run only.

### Frontend

```bash
# In a separate terminal
cd frontend

# Install dependencies
npm install

# Create frontend/.env with:
# VITE_API_URL=http://localhost:8000

# Start the dev server
npm run dev
```

Frontend runs at **http://localhost:5173**.

---

## Deployment

### Backend → Render

1. Push the repo to GitHub
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your GitHub repo
4. Set **Root Directory** to `backend`
5. Render auto-detects the `Dockerfile` — leave settings as default
6. Add environment variable: `GROQ_API_KEY = your_key_here`
7. Deploy — you will receive a `*.onrender.com` URL

### Frontend → Vercel

```bash
cd frontend
npm install -g vercel
vercel
```

When prompted, set `VITE_API_URL` to your Render backend URL.

---

## Free Tier Limits

| Service | Free Allowance |
|---|---|
| **Groq** | 14,400 requests/day |
| **Render** | 750 hours/month, sleeps after 15 min inactivity |
| **Vercel** | Unlimited static deployments |
| **sentence-transformers** | Unlimited — runs locally |
| **ChromaDB** | Unlimited — stores locally |

---

<div align="center">
Built with FastAPI · React · LangChain · ChromaDB · sentence-transformers · Groq · Docker
</div>
