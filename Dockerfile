# ╔══════════════════════════════════════════════════════════════╗
# ║  STAGE 1 — Build the React frontend                         ║
# ╚══════════════════════════════════════════════════════════════╝
FROM node:20-slim AS frontend-build

WORKDIR /frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ .

# Use ARG + ENV (most compatible way across all Docker versions)
ARG VITE_API_URL=""
ENV VITE_API_URL=""

# Run build with verbose output so we can see any errors clearly
RUN npm run build -- --logLevel info

# ╔══════════════════════════════════════════════════════════════╗
# ║  STAGE 2 — Python backend + serve built frontend            ║
# ╚══════════════════════════════════════════════════════════════╝
FROM python:3.11-slim

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir aiofiles

COPY backend/ .

COPY --from=frontend-build /frontend/dist ./static

RUN mkdir -p /app/chroma_db

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]