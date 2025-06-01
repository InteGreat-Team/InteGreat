import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "../../firebase"
import SignIn from "./SignIn"
import LandingPage from "./LandingPage"

function App() {
  const [authChecked, setAuthChecked] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // List of allowed emails
      const allowedEmails = ["integreatapi@gmail.com", "apdiaz@ust.edu.ph", "jgcatubag@ust.edu.ph"];
      
      if (user && user.email && allowedEmails.includes(user.email)) {
        try {
          // Force token refresh to verify user still exists on server
          await user.getIdToken(true);
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Auth token invalid:", error);
          await auth.signOut();
          setIsAuthenticated(false);
        }
      } else if (user) {
        // If user exists but email doesn't match, sign them out
        console.log("Unauthorized email:", user.email);
        await auth.signOut();
        setIsAuthenticated(false);
      } else {
        // No user is signed in
        setIsAuthenticated(false);
      }
      setAuthChecked(true);
    });

    return () => unsubscribe();
  }, [])

  if (!authChecked) {
    return <div className="loading">Initializing...</div>
  }

  return (
    <Router>
      <Routes>
        <Route path="/signin" element={isAuthenticated ? <Navigate to="/" /> : <SignIn />} />
        <Route path="/" element={isAuthenticated ? <LandingPage /> : <Navigate to="/signin" />} />
      </Routes>
    </Router>
  )
}

export default App