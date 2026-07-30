import { useState } from 'react'

export default function TextInput({ onSubmit }) {
  const [text, setText] = useState('')

  const handleSubmit = () => {
    if (text.trim()) {
      onSubmit(text.trim())
      setText('')
    }
  }

  return (
    <div className="text-input-container">
      <textarea
        className="text-input"
        placeholder="Type your note here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        className="submit-button"
        onClick={handleSubmit}
        disabled={!text.trim()}
      >
        Save
      </button>
    </div>
  )
}
