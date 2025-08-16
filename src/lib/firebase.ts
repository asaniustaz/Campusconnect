
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCJyEkMjRytth7QVSJMH404uuJVE7-oaTQ",
  authDomain: "studio-4p87e.firebaseapp.com",
  projectId: "studio-4p87e",
  storageBucket: "studio-4p87e.firebasestorage.app",
  messagingSenderId: "307339231958",
  appId: "1:307339231958:web:9c71553fb78230f63abf77"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
