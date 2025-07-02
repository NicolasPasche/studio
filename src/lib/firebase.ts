import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your project's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAoSrv18i8U8nNgDRgro6bk2uLIeLjDSME",
  authDomain: "apex-workflow-f3d61.firebaseapp.com",
  projectId: "apex-workflow-f3d61",
  storageBucket: "apex-workflow-f3d61.firebasestorage.app",
  messagingSenderId: "705154707359",
  appId: "1:705154707359:web:fc52dbfb5ae668bd7b57aa",
  measurementId: "G-3M0BVVL9V0"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
