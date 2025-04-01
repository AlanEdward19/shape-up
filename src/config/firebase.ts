
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// For development/testing purposes, use these default values if env vars are not set
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBbM1YyarYerY-Bo4rUpR_trYEG5YySvQg",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "shapeup-demo.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "shapeup-demo",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "shapeup-demo.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "701234567890",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:701234567890:web:a1b2c3d4e5f6a7b8c9d0e1"
};

// These fallback values are for demonstration only and should be replaced with your actual Firebase config
console.log("Firebase config being used:", {
  apiKey: firebaseConfig.apiKey ? "Set (hidden)" : "Not set",
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
