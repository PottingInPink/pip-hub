import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyD-KM6IAOEtrKoQg0kdjxF9wTNPRS975kg",
  authDomain: "pip-assistant-96a08.firebaseapp.com",
  projectId: "pip-assistant-96a08",
  storageBucket: "pip-assistant-96a08.firebasestorage.app",
  messagingSenderId: "616577685966",
  appId: "1:616577685966:web:1288637967629e5863b39f"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
