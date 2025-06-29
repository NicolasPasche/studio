import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// NOTE: Add your "appId" after registering your web app in the Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyAoSrv18i8U8nNgDRgro6bk2uLIeLjDSME",
  authDomain: "apex-workflow-f3d61.firebaseapp.com",
  projectId: "apex-workflow-f3d61",
  storageBucket: "apex-workflow-f3d61.appspot.com",
  messagingSenderId: "705154707359",
  appId: "YOUR_APP_ID_HERE" // <-- Get this from the Firebase console
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
