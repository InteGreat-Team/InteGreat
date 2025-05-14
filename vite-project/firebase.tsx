// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCNgZ6JWvz66oL7nDWMqREkxZgifCcsvTA",
  authDomain: "react-auth-7273d.firebaseapp.com",
  projectId: "react-auth-7273d",
  storageBucket: "react-auth-7273d.firebasestorage.app",
  messagingSenderId: "80622204243",
  appId: "1:80622204243:web:f4eec754ccf841419d1da6",
  measurementId: "G-MYJY0HX62R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };