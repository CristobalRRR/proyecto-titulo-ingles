import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "pti-db.firebaseapp.com",
  databaseURL: "https://pti-db-default-rtdb.firebaseio.com",
  projectId: "pti-db",
  storageBucket: "pti-db.firebasestorage.app",
  messagingSenderId: "588194658047",
  appId: "1:588194658047:web:f9480346c588aa25c37eca",
  measurementId: "G-0QDRF9QKEH"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export {app, auth};