import { useState, useRef, useEffect } from 'react'

export default function VoiceInput({ onSubmit }) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [status, setStatus] = useState('')
  const recognitionRef = useRef(null)

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setStatus('Voice input not supported on this device')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setIsListening(true)
      setStatus('Listening...')
      setTranscript('')
    }

    recognition.onresult = (event) => {
      let interimTranscript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptSegment = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          setTranscript(prev => (prev + transcriptSegment).trim())
        } else {
          interimTranscript += transcriptSegment
        }
      }
      if (interimTranscript) {
        setStatus(`Hearing: ${interimTranscript}`)
      }
    }

    recognition.onerror = (event) => {
      setStatus(`Error: ${event.error}`)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
      if (transcript) {
        setStatus('Ready to submit or record again')
      } else {
        setStatus('')
      }
    }

    recognitionRef.current = recognition
  }, [])

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start()
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
  }

  const handleSubmit = () => {
    if (transcript.trim()) {
      onSubmit(transcript.trim())
      setTranscript('')
      setStatus('')
    }
  }

  const handleClear = () => {
    setTranscript('')
    setStatus('')
    if (isListening) {
      stopListening()
    }
  }

  return (
    <div className="voice-input-container">
      <div>
        {isListening ? (
          <button 
            className="voice-button listening" 
            onClick={stopListening}
          >
            🎤 Stop Recording
          </button>
        ) : (
          <button 
            className="voice-button" 
            onClick={startListening}
          >
            🎤 Start Recording
          </button>
        )}
      </div>

      {transcript && (
        <div className="voice-transcript">{transcript}</div>
      )}

      <div className="voice-status">{status}</div>

      {transcript && (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className="submit-button" 
            onClick={handleSubmit}
            style={{ flex: 1 }}
          >
            Save
          </button>
          <button 
            onClick={handleClear}
            style={{
              padding: '12px',
              border: '2px solid #ddd',
              background: 'white',
              borderRadius: '8px',
              cursor: 'pointer',
              flex: 1
            }}
          >
            Clear
          </button>
        </div>
      )}
    </div>
  )
}
