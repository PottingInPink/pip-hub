import { useState, useEffect } from 'react'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, query, orderBy, getDocs } from 'firebase/firestore'
import './App.css'
import Menu from './components/Menu'
import VoiceInput from './components/VoiceInput'
import TextInput from './components/TextInput'
import LogViewer from './components/LogViewer'

const firebaseConfig = {
  apiKey: "AIzaSyD-KM6IAOEtrKoQg0kdjxF9wTNPRS975kg",
  authDomain: "pip-assistant-96a08.firebaseapp.com",
  projectId: "pip-assistant-96a08",
  storageBucket: "pip-assistant-96a08.firebasestorage.app",
  messagingSenderId: "616577685966",
  appId: "1:616577685966:web:1288637967629e5863b39f"
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const CATEGORIES = [
  'Sales Tracking',
  'Show Notes',
  'Inventory',
  'To Make',
  'Glaze Inventory',
  'Clay Inventory',
  'To Buy',
  'To Do'
]

function App() {
  const [currentView, setCurrentView] = useState('menu')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [entries, setEntries] = useState([])
  const [useVoice, setUseVoice] = useState(true)

  useEffect(() => {
    if (selectedCategory) {
      loadEntries(selectedCategory)
    }
  }, [selectedCategory])

  const loadEntries = async (category) => {
    try {
      const q = query(
        collection(db, 'logs'),
        orderBy('timestamp', 'desc')
      )
      const snapshot = await getDocs(q)
      const categoryEntries = snapshot.docs
        .filter(doc => doc.data().category === category)
        .map(doc => ({ id: doc.id, ...doc.data() }))
      setEntries(categoryEntries)
    } catch (error) {
      console.error('Error loading entries:', error)
    }
  }

  const handleAddEntry = async (text) => {
    try {
      await addDoc(collection(db, 'logs'), {
        category: selectedCategory,
        text: text,
        timestamp: new Date(),
        createdAt: new Date().toISOString()
      })
      await loadEntries(selectedCategory)
    } catch (error) {
      console.error('Error adding entry:', error)
      alert('Error saving entry. Try again.')
    }
  }

  const handleCategorySelect = (category) => {
    setSelectedCategory(category)
    setCurrentView('log')
  }

  const handleBack = () => {
    setCurrentView('menu')
    setSelectedCategory(null)
  }

  return (
    <div className="app-container">
      {currentView === 'menu' && (
        <Menu 
          categories={CATEGORIES}
          onSelect={handleCategorySelect}
        />
      )}

      {currentView === 'log' && selectedCategory && (
        <div className="log-view">
          <div className="log-header">
            <button onClick={handleBack} className="back-button">←</button>
            <h1>{selectedCategory}</h1>
            <div style={{ width: '44px' }}></div>
          </div>

          <div className="input-section">
            <div className="toggle-buttons">
              <button 
                className={`toggle ${useVoice ? 'active' : ''}`}
                onClick={() => setUseVoice(true)}
              >
                🎤 Voice
              </button>
              <button 
                className={`toggle ${!useVoice ? 'active' : ''}`}
                onClick={() => setUseVoice(false)}
              >
                ⌨️ Text
              </button>
            </div>

            {useVoice ? (
              <VoiceInput onSubmit={handleAddEntry} />
            ) : (
              <TextInput onSubmit={handleAddEntry} />
            )}
          </div>

          <LogViewer entries={entries} />
        </div>
      )}
    </div>
  )
}

export default App
