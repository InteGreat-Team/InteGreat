import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDx0SGGNYyxj53icCxDS8OeRk2uMzTAocM",
  authDomain: "integreat-core.firebaseapp.com",
  projectId: "integreat-core",
  storageBucket: "integreat-core.firebasestorage.app",
  messagingSenderId: "454462420902",
  appId: "1:454462420902:web:2f9d406177109d91848167",
  measurementId: "G-B560N8YDQD"
};
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const provider = new GoogleAuthProvider()

export { auth, provider }
