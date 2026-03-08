# 📄 PDF RAG Chatbot — Free Stack
**Upload any PDF → Ask questions → Get AI answers**
Powered by Groq (free LLM) + sentence-transformers (free embeddings) + ChromaDB (free vector DB)

---

## ✅ What You Need Before Starting
- [VS Code](https://code.visualstudio.com/) installed
- [Python 3.10+](https://www.python.org/downloads/) installed
- [Node.js 18+](https://nodejs.org/) installed
- [Git](https://git-scm.com/) installed
- A free [Groq account](https://console.groq.com) (no credit card)
- A free [GitHub account](https://github.com) (for deployment)

---

## 🗂️ Project Structure
```
pdf-rag/
├── backend/
│   ├── rag/
│   │   ├── __init__.py
│   │   ├── parser.py       ← PDF parsing & chunking
│   │   ├── embedder.py     ← Free local embeddings
│   │   ├── vectorstore.py  ← ChromaDB vector store
│   │   └── chain.py        ← Groq LLM + memory
│   ├── main.py             ← FastAPI app
│   ├── requirements.txt
│   └── .env                ← Your API key goes here
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Upload.jsx  ← PDF upload screen
    │   │   └── Chat.jsx    ← Chat interface
    │   ├── App.jsx
    │   ├── api.js
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── .env
```

---

## 🚀 Step 1 — Get Your Free Groq API Key

1. Go to **https://console.groq.com**
2. Sign up (free, no credit card)
3. Click **API Keys** → **Create API Key**
4. Copy your key (starts with `gsk_...`)
5. Open `backend/.env` and replace `your_groq_api_key_here` with your key:
   ```
   GROQ_API_KEY=gsk_your_actual_key_here
   CHROMA_PERSIST_DIR=./chroma_db
   ```

---

## 🐍 Step 2 — Set Up the Backend

Open a terminal in VS Code (`Ctrl + `` ` ``):

```bash
# Navigate into backend folder
cd backend

# Create a virtual environment
python -m venv venv

# Activate it
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install all dependencies
pip install -r requirements.txt
```

⚠️ **First install takes 2–5 minutes** — sentence-transformers downloads a small AI model (~80MB).

---

## ▶️ Step 3 — Run the Backend

```bash
# Make sure you're in the backend/ folder with venv active
uvicorn main:app --reload --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

✅ Test it: Open http://localhost:8000/health in your browser — you should see `{"status":"ok"}`.

---

## ⚛️ Step 4 — Set Up the Frontend

Open a **second terminal** in VS Code:

```bash
# Navigate into frontend folder
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms
  ➜  Local:   http://localhost:5173/
```

✅ Open **http://localhost:5173** in your browser — you'll see the PDF upload screen!

---

## 🧪 Step 5 — Test It Locally

1. Open http://localhost:5173
2. Drag & drop any PDF (try a research paper or any text PDF)
3. Wait for processing (first time is slower while the embedding model loads)
4. Ask questions in the chat!

---

## 🌐 Step 6 — Deploy to the Internet (Free)

### 6A — Push to GitHub

```bash
# From the root pdf-rag/ folder
git init
git add .
git commit -m "Initial commit: PDF RAG chatbot"

# Create a new repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/pdf-rag.git
git push -u origin main
```

### 6B — Deploy Backend to Render (Free)

1. Go to **https://render.com** → Sign up free
2. Click **New** → **Web Service**
3. Connect your GitHub repo
4. Set these settings:
   - **Root Directory:** `backend`
   - **Environment:** `Python`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Click **Advanced** → **Add Environment Variable**:
   - Key: `GROQ_API_KEY` → Value: `your_key_here`
6. Click **Create Web Service**

Wait ~3 minutes for it to deploy. You'll get a URL like:
`https://pdf-rag-xxxx.onrender.com`

✅ Test: Visit `https://pdf-rag-xxxx.onrender.com/health`

### 6C — Deploy Frontend to Vercel (Free)

```bash
cd frontend

# Update .env for production
# Change VITE_API_URL to your Render URL:
# VITE_API_URL=https://pdf-rag-xxxx.onrender.com

npm install -g vercel
vercel
```

Follow the prompts. When asked about environment variables, set:
- `VITE_API_URL` = `https://pdf-rag-xxxx.onrender.com`

You'll get a live URL like: `https://pdf-rag.vercel.app` 🎉

---

## 💡 Common Issues & Fixes

| Problem | Fix |
|---|---|
| `ModuleNotFoundError` | Make sure venv is activated: `venv\Scripts\activate` |
| `Connection refused` on upload | Backend isn't running — start it with `uvicorn main:app --reload` |
| First upload is very slow | Normal — embedding model downloads ~80MB on first run |
| "Scanned PDF" error | PDF must have actual text (not just images of text) |
| Render backend sleeps | Free tier sleeps after 15min — first request takes 30s to wake up |
| CORS error in browser | Make sure `VITE_API_URL` points to the correct backend URL |

---

## 🔑 Free Tier Limits

| Service | Free Limit |
|---|---|
| **Groq** | 14,400 requests/day, rate limited per minute |
| **Render** | 750 hrs/month, sleeps after 15min inactivity |
| **Vercel** | Unlimited static deploys |
| **sentence-transformers** | Unlimited (runs locally) |
| **ChromaDB** | Unlimited (stores locally) |

**Total monthly cost: $0** ✅

---

## 🛠️ VS Code Extensions (Recommended)

Install these for the best dev experience:
- **Python** (Microsoft)
- **Pylance**
- **ES7+ React/Redux/React-Native snippets**
- **Thunder Client** (test API endpoints without leaving VS Code)

---

## 📬 Need Help?

If something isn't working:
1. Check the terminal running the backend for error messages
2. Check the browser console (F12) for frontend errors
3. Make sure both terminals are running (backend on 8000, frontend on 5173)
