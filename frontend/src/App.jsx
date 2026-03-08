import { useState } from 'react'
import Upload from './components/Upload'
import Chat from './components/Chat'

export default function App() {
  const [session, setSession] = useState(null) // { sessionId, fileName, chunksStored }

  const handleUploadSuccess = (data, fileName) => {
    setSession({
      sessionId: data.session_id,
      fileName,
      chunksStored: data.chunks_stored,
    })
  }

  const handleReset = () => {
    setSession(null)
  }

  if (session) {
    return (
      <Chat
        sessionId={session.sessionId}
        fileName={session.fileName}
        chunksStored={session.chunksStored}
        onReset={handleReset}
      />
    )
  }

  return <Upload onUploadSuccess={handleUploadSuccess} />
}
