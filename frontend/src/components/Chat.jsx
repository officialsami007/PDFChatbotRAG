import { useState, useRef, useEffect } from 'react'
import { askQuestion, endSession } from '../api'

const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    background: 'var(--bg)',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 24px',
    borderBottom: '1px solid var(--border)',
    background: 'var(--bg2)',
    flexShrink: 0,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    flexShrink: 0,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: 'var(--text)',
    maxWidth: 280,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  headerSub: {
    fontSize: 11,
    color: 'var(--text3)',
    marginTop: 1,
  },
  badge: {
    padding: '3px 8px',
    borderRadius: 5,
    fontSize: 10,
    fontWeight: 700,
    background: 'rgba(74,222,128,0.1)',
    color: 'var(--green)',
    border: '1px solid rgba(74,222,128,0.2)',
    letterSpacing: 0.5,
  },
  newBtn: {
    padding: '7px 14px',
    background: 'transparent',
    border: '1px solid var(--border2)',
    borderRadius: 8,
    color: 'var(--text2)',
    fontSize: 12,
    fontWeight: 500,
    transition: 'all 0.15s',
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    gap: 12,
    color: 'var(--text3)',
    textAlign: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: 'var(--text2)',
  },
  emptySub: {
    fontSize: 14,
    lineHeight: 1.6,
    maxWidth: 360,
  },
  suggestions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginTop: 16,
  },
  suggestionBtn: {
    padding: '8px 14px',
    background: 'var(--bg3)',
    border: '1px solid var(--border)',
    borderRadius: 20,
    color: 'var(--text2)',
    fontSize: 13,
    transition: 'all 0.15s',
    cursor: 'pointer',
  },
  msgRow: (role) => ({
    display: 'flex',
    justifyContent: role === 'user' ? 'flex-end' : 'flex-start',
    gap: 10,
    alignItems: 'flex-start',
    maxWidth: '100%',
  }),
  avatar: (role) => ({
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: role === 'user'
      ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
      : 'linear-gradient(135deg, #0f172a, #1e293b)',
    border: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    flexShrink: 0,
  }),
  bubble: (role) => ({
    maxWidth: '72%',
    padding: '12px 16px',
    borderRadius: role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
    background: role === 'user' ? 'var(--accent)' : 'var(--bg3)',
    border: role === 'user' ? 'none' : '1px solid var(--border)',
    color: 'var(--text)',
    fontSize: 14,
    lineHeight: 1.65,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  }),
  errorBubble: {
    maxWidth: '72%',
    padding: '12px 16px',
    borderRadius: '18px 18px 18px 4px',
    background: 'rgba(248,113,113,0.08)',
    border: '1px solid rgba(248,113,113,0.25)',
    color: 'var(--red)',
    fontSize: 14,
    lineHeight: 1.65,
  },
  meta: {
    fontSize: 11,
    color: 'var(--text3)',
    marginTop: 4,
    paddingLeft: 4,
  },
  thinking: {
    display: 'flex',
    gap: 5,
    padding: '14px 16px',
    background: 'var(--bg3)',
    border: '1px solid var(--border)',
    borderRadius: '18px 18px 18px 4px',
  },
  dot: (delay) => ({
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: 'var(--text3)',
    animation: 'bounce 1.2s ease-in-out infinite',
    animationDelay: delay,
  }),
  inputArea: {
    padding: '16px 24px',
    borderTop: '1px solid var(--border)',
    background: 'var(--bg2)',
    flexShrink: 0,
  },
  inputRow: {
    display: 'flex',
    gap: 10,
    alignItems: 'flex-end',
    background: 'var(--bg3)',
    border: '1px solid var(--border2)',
    borderRadius: 14,
    padding: '10px 10px 10px 16px',
    transition: 'border-color 0.2s',
  },
  textarea: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: 'var(--text)',
    fontSize: 14,
    resize: 'none',
    lineHeight: 1.5,
    maxHeight: 120,
    minHeight: 22,
  },
  sendBtn: (active) => ({
    width: 36,
    height: 36,
    borderRadius: 9,
    border: 'none',
    background: active ? 'var(--accent)' : 'var(--border)',
    color: '#fff',
    fontSize: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'all 0.15s',
  }),
  inputHint: {
    fontSize: 11,
    color: 'var(--text3)',
    marginTop: 8,
    textAlign: 'center',
  },
}

const SUGGESTIONS = [
  'Summarize this document',
  'What are the key points?',
  'What conclusions does it reach?',
  'Are there any important dates or numbers?',
]

export default function Chat({ sessionId, fileName, chunksStored, onReset }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef()
  const textareaRef = useRef()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = async (text) => {
    const question = (text || input).trim()
    if (!question || loading) return
    setInput('')
    setMessages(m => [...m, { role: 'user', text: question, time: new Date() }])
    setLoading(true)

    try {
      const data = await askQuestion(sessionId, question)
      setMessages(m => [...m, { role: 'assistant', text: data.answer, chunks: data.chunks_used, time: new Date() }])
    } catch (err) {
      setMessages(m => [...m, {
        role: 'error',
        text: err.response?.data?.detail || 'Something went wrong. Please try again.',
        time: new Date()
      }])
    } finally {
      setLoading(false)
      textareaRef.current?.focus()
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const handleReset = async () => {
    try { await endSession(sessionId) } catch {}
    onReset()
  }

  const fmt = (date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <div style={styles.root}>
      {/* Keyframe injection */}
      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.headerIcon}>📄</div>
          <div>
            <div style={styles.headerTitle}>{fileName}</div>
            <div style={styles.headerSub}>{chunksStored} chunks indexed</div>
          </div>
          <div style={styles.badge}>LIVE</div>
        </div>
        <button style={styles.newBtn} onClick={handleReset}>
          + New PDF
        </button>
      </div>

      {/* Messages */}
      <div style={styles.messages}>
        {messages.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>💬</div>
            <div style={styles.emptyTitle}>Ask anything about your PDF</div>
            <div style={styles.emptySub}>
              The document has been indexed and is ready. Try one of these questions or type your own.
            </div>
            <div style={styles.suggestions}>
              {SUGGESTIONS.map(s => (
                <button key={s} style={styles.suggestionBtn} onClick={() => send(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((m, i) => (
              <div key={i}>
                <div style={styles.msgRow(m.role)}>
                  {m.role !== 'user' && (
                    <div style={styles.avatar('ai')}>
                      {m.role === 'error' ? '⚠️' : '🤖'}
                    </div>
                  )}
                  <div>
                    <div style={m.role === 'error' ? styles.errorBubble : styles.bubble(m.role)}>
                      {m.text}
                    </div>
                    <div style={{ ...styles.meta, textAlign: m.role === 'user' ? 'right' : 'left' }}>
                      {fmt(m.time)}
                      {m.chunks && ` · ${m.chunks} chunks retrieved`}
                    </div>
                  </div>
                  {m.role === 'user' && (
                    <div style={styles.avatar('user')}>👤</div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div style={styles.msgRow('assistant')}>
                <div style={styles.avatar('ai')}>🤖</div>
                <div style={styles.thinking}>
                  <div style={styles.dot('0s')} />
                  <div style={styles.dot('0.2s')} />
                  <div style={styles.dot('0.4s')} />
                </div>
              </div>
            )}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={styles.inputArea}>
        <div style={styles.inputRow}>
          <textarea
            ref={textareaRef}
            style={styles.textarea}
            placeholder="Ask a question about your PDF..."
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
            }}
            onKeyDown={handleKey}
            rows={1}
          />
          <button
            style={styles.sendBtn(input.trim().length > 0 && !loading)}
            onClick={() => send()}
            disabled={!input.trim() || loading}
          >
            ➤
          </button>
        </div>
        <div style={styles.inputHint}>Press Enter to send · Shift+Enter for new line · Powered by Groq (free)</div>
      </div>
    </div>
  )
}
