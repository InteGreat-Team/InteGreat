"use client"

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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user)
      setAuthChecked(true)
    })

    return () => unsubscribe()
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
