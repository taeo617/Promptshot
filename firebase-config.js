import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getFirestore, doc, setDoc, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

// Web app's Firebase configuration
// REPLACE these placeholder values with your real credentials from the Firebase Console!
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Check if credentials are still placeholder
const isPlaceholder = firebaseConfig.apiKey === "YOUR_API_KEY" || firebaseConfig.apiKey === "";

let app, db;
if (!isPlaceholder) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log("🔥 Firebase initialized successfully!");
  } catch (error) {
    console.error("❌ Failed to initialize Firebase:", error);
  }
} else {
  console.warn("⚠️ Firebase integration is in PLACEHOLDER mode. Please paste your credentials in firebase-config.js to enable real-time sync!");
}

export { db, isPlaceholder, doc, setDoc, onSnapshot };
