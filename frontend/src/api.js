import axios from 'axios'

const api = axios.create({
  baseURL: '',
  timeout: 60000,
})

export const uploadPDF = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data // { session_id, chunks_stored, message }
}

export const askQuestion = async (session_id, question) => {
  const { data } = await api.post('/ask', { session_id, question })
  return data // { answer, chunks_used }
}

export const endSession = async (session_id) => {
  await api.delete(`/session/${session_id}`)
}
