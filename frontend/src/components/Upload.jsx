import { useState, useRef } from 'react'
import { uploadPDF } from '../api'

const styles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '24px',
    background: 'var(--bg)',
  },
  card: {
    width: '100%',
    maxWidth: '480px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '40px',
  },
  logoIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 22,
  },
  logoText: {
    fontSize: 22,
    fontWeight: 700,
    color: 'var(--text)',
    letterSpacing: -0.5,
  },
  logoSub: {
    fontSize: 12,
    color: 'var(--text3)',
    marginTop: 2,
  },
  heading: {
    fontSize: 28,
    fontWeight: 700,
    color: 'var(--text)',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  sub: {
    fontSize: 14,
    color: 'var(--text2)',
    marginBottom: 32,
    lineHeight: 1.6,
  },
  dropzone: (drag) => ({
    border: `2px dashed ${drag ? 'var(--accent)' : 'var(--border2)'}`,
    borderRadius: 16,
    padding: '48px 24px',
    textAlign: 'center',
    background: drag ? 'var(--accent-glow)' : 'var(--bg2)',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginBottom: 16,
  }),
  dropIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  dropTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: 'var(--text)',
    marginBottom: 6,
  },
  dropSub: {
    fontSize: 13,
    color: 'var(--text3)',
  },
  btn: (loading) => ({
    width: '100%',
    padding: '14px',
    background: loading ? 'var(--border)' : 'var(--accent)',
    border: 'none',
    borderRadius: 10,
    color: '#fff',
    fontSize: 15,
    fontWeight: 600,
    transition: 'all 0.2s',
    opacity: loading ? 0.7 : 1,
  }),
  fileChip: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 14px',
    background: 'var(--bg3)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 13,
    color: 'var(--text2)',
  },
  error: {
    padding: '12px 14px',
    background: 'rgba(248,113,113,0.08)',
    border: '1px solid rgba(248,113,113,0.3)',
    borderRadius: 8,
    color: 'var(--red)',
    fontSize: 13,
    marginBottom: 16,
  },
  progress: {
    marginTop: 16,
    padding: '14px',
    background: 'var(--bg3)',
    border: '1px solid var(--border)',
    borderRadius: 10,
    fontSize: 13,
    color: 'var(--text2)',
    textAlign: 'center',
  },
  steps: {
    display: 'flex',
    gap: 8,
    marginTop: 32,
    flexWrap: 'wrap',
  },
  stepChip: (active) => ({
    padding: '5px 12px',
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 600,
    background: active ? 'rgba(99,102,241,0.15)' : 'var(--bg2)',
    color: active ? 'var(--accent2)' : 'var(--text3)',
    border: `1px solid ${active ? 'rgba(99,102,241,0.3)' : 'var(--border)'}`,
    letterSpacing: 0.5,
  }),
}

export default function Upload({ onUploadSuccess }) {
  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(0)
  const inputRef = useRef()

  const steps = ['Select PDF', 'Parse & Chunk', 'Embed Text', 'Store Vectors', 'Ready!']

  const handleFile = (f) => {
    if (f && f.type === 'application/pdf') {
      setFile(f)
      setError('')
    } else {
      setError('Please select a valid PDF file.')
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    handleFile(f)
  }

  const handleUpload = async () => {
    if (!file) { setError('Please select a PDF first.'); return }
    setLoading(true)
    setError('')

    // Animate through steps
    let s = 1
    const interval = setInterval(() => {
      setStep(s++)
      if (s > 3) clearInterval(interval)
    }, 900)

    try {
      const data = await uploadPDF(file)
      setStep(4)
      setTimeout(() => onUploadSuccess(data, file.name), 600)
    } catch (err) {
      clearInterval(interval)
      setStep(0)
      setError(err.response?.data?.detail || 'Upload failed. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>📄</div>
          <div>
            <div style={styles.logoText}>PDF Chatbot</div>
            <div style={styles.logoSub}>Powered by Groq + Llama 3.3</div>
          </div>
        </div>

        <h1 style={styles.heading}>Chat with your PDF</h1>
        <p style={styles.sub}>Upload any PDF — research papers, docs, contracts, books — and ask questions in plain English.</p>

        {error && <div style={styles.error}>⚠️ {error}</div>}

        <div
          style={styles.dropzone(dragging)}
          onClick={() => inputRef.current.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf"
            style={{ display: 'none' }}
            onChange={(e) => handleFile(e.target.files[0])}
          />
          <div style={styles.dropIcon}>{dragging ? '📂' : '📁'}</div>
          <div style={styles.dropTitle}>{dragging ? 'Drop it!' : 'Drop PDF here or click to browse'}</div>
          <div style={styles.dropSub}>Max recommended: 50MB · Text-based PDFs only</div>
        </div>

        {file && (
          <div style={styles.fileChip}>
            <span>📄</span>
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
            <span style={{ color: 'var(--text3)' }}>
              {file.size < 1024 * 1024
                ? (file.size / 1024).toFixed(0) + ' KB'
                : (file.size / 1024 / 1024).toFixed(1) + ' MB'}
            </span>
            {!loading && (
              <span
                style={{ cursor: 'pointer', color: 'var(--text3)', fontSize: 16 }}
                onClick={() => setFile(null)}
              >✕</span>
            )}
          </div>
        )}

        <button
          style={styles.btn(loading)}
          onClick={handleUpload}
          disabled={loading || !file}
        >
          {loading ? '⏳ Processing...' : '🚀 Upload & Process PDF'}
        </button>

        {loading && (
          <div style={styles.progress}>
            <div style={{ marginBottom: 12, color: 'var(--text2)' }}>
              {steps[step]}...
            </div>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
              {steps.map((s, i) => (
                <div key={s} style={styles.stepChip(i <= step)}>{s}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
