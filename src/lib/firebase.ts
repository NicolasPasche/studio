import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your project's Firebase configuration
const firebaseConfig = {
  apiKey: "AlzaSyAoSrv18i8U8nNgDRgro6bk2uLleLjDSME",
  authDomain: "apex-workflow-f3d61.firebaseapp.com",
  projectId: "apex-workflow-f3d61",
  storageBucket: "apex-workflow-f3d61.appspot.com",
  messagingSenderId: "705154707359",
  appId: "1:705154707359:web:968f238561129f170438c8"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
