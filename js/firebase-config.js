// ════════════════════════════════════════
// FIREBASE CONFIG — Global Index Tracker
// ════════════════════════════════════════
// 
// 🔥 SETUP INSTRUCTIONS:
// 1. Go to https://console.firebase.google.com/
// 2. Create a new project → "global-index-tracker"
// 3. Add a Web App → copy your firebaseConfig
// 4. Enable Firestore Database (Start in test mode)
// 5. Replace the config below with your own values
//
// ════════════════════════════════════════

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, serverTimestamp }
  from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ── YOUR FIREBASE CONFIG (Replace with yours) ──
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// ── INIT ──
let db = null;
try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  console.log("✅ Firebase connected");
  loadFromFirestore();
} catch(e) {
  console.warn("⚠️ Firebase not configured yet. Using localStorage only.");
}

// ── SAVE USER-ADDED INDEX TO FIRESTORE ──
export async function saveIndexToFirestore(indexData) {
  if (!db) return false;
  try {
    await addDoc(collection(db, "user_indexes"), {
      ...indexData,
      createdAt: serverTimestamp()
    });
    console.log("✅ Saved to Firestore");
    return true;
  } catch(e) {
    console.error("Firestore write error:", e);
    return false;
  }
}

// ── LOAD USER INDEXES FROM FIRESTORE ──
export async function loadFromFirestore() {
  if (!db) return;
  try {
    const snapshot = await getDocs(collection(db, "user_indexes"));
    const firestoreIndexes = [];
    snapshot.forEach(doc => firestoreIndexes.push({ id: doc.id, ...doc.data() }));
    // Merge with local if needed
    if (firestoreIndexes.length > 0) {
      window.firestoreIndexes = firestoreIndexes;
      console.log(`📦 Loaded ${firestoreIndexes.length} indexes from Firestore`);
    }
  } catch(e) {
    console.warn("Could not load from Firestore:", e.message);
  }
}
