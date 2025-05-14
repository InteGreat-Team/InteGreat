// src/LandingPage.tsx
import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from '../firebase';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("✅ User signed out");
    } catch (error) {
      console.error("❌ Logout error:", error);
    }
  };

  return (
    <div className="landing-container">
      <h1>insert dashboard</h1>
      {user ? (
        <>
          <p>Signed in as: {user.displayName || user.email}</p>
          <button className="logout-button" onClick={handleLogout}>
            Log Out
          </button>
        </>
      ) : (
        <Link to="/signin" className="cta-button">Sign In</Link>
      )}
    </div>
  );
};

export default LandingPage;
