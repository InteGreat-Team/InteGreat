"use client"

import { useState, useEffect } from "react"
import { signOut } from "firebase/auth"
import type { User } from "firebase/auth"
import { auth } from "../../firebase"
import { useNavigate } from "react-router-dom"
import { LayoutGrid, Users, Settings, LogOut } from "lucide-react"
import PowerBIDashboard from "./PowerBIDashboard"
import "./LandingPage.css"

const LandingPage = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // Set up auth state listener
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser)
      setLoading(false)

      // If no user is logged in, redirect to sign in
      if (!currentUser) {
        navigate("/signin")
      }
    })

    // Clean up the listener on component unmount
    return () => unsubscribe()
  }, [navigate])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      console.log("✅ User signed out")
      navigate("/signin")
    } catch (error) {
      console.error("❌ Logout error:", error)
    }
  }

  return (
    <>
      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="dashboard-container">
          {/* Sidebar */}
          <aside className="sidebar">
            <div className="sidebar-header">
              <div className="logo-container">
                <div className="logo-circle"></div>
                <h2 className="logo-text">INTEGREAT</h2>
              </div>
            </div>

            <div className="sidebar-section">
              <p className="section-title">MENU</p>
              <ul className="nav-list">
                <li className="nav-item active">
                  <LayoutGrid className="nav-icon" />
                  <span>Dashboard</span>
                </li>
                <li className="nav-item">
                  <Users className="nav-icon" />
                  <span>Accounts</span>
                </li>
              </ul>
            </div>

            <div className="sidebar-section">
              <p className="section-title">OTHERS</p>
              <ul className="nav-list">
                <li className="nav-item">
                  <Settings className="nav-icon" />
                  <span>Settings</span>
                </li>
                <li className="nav-item" onClick={handleLogout}>
                  <LogOut className="nav-icon" />
                  <span>Log Out</span>
                </li>
              </ul>
            </div>
          </aside>

          {/* Main Content */}
          <main className="main-content">
            <h1 className="page-title">Dashboard</h1>

            {user && (
              <div className="user-welcome">
                <h2>Welcome back!</h2>
                <p>You are now signed in to your dashboard.</p>
              </div>
            )}

            {/* Power BI Dashboard */}
            <div className="dashboard-section">
              <PowerBIDashboard
                reportId="4314adda-bb34-48da-90dd-0b4c9ef4a326"
                ctid="2840082d-702c-4fb1-9885-abddd1ddaa1e"
                height={600}
              />
            </div>
          </main>
        </div>
      )}
    </>
  )
}

export default LandingPage
