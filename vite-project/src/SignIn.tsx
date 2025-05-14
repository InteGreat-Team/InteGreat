import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase";
import { useNavigate } from 'react-router-dom';
import googleLogo from './assets/google.webp';
import './SignIn.css';
import logo from './assets/logo.png';

function SignIn() {
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      console.log("✅ Logged in user:", result.user);
      navigate('/');
    } catch (error) {
      console.error("❌ Sign-in error:", error);
    }
  };

  return (
    <div className="signin-container">
      <div className="left-panel">
        
        <h1>InteGreat</h1>
      </div>
      <div className="divider"></div>
      <div className="right-panel">
        <h2>Welcome</h2>
        <p>Please login.</p>
        <button className="google-signin-btn" onClick={handleGoogleSignIn}>
          <img src={googleLogo} alt="Google" />
          <span>Sign in with Google</span>
        </button>
      </div>
    </div>
  );
}

export default SignIn;
