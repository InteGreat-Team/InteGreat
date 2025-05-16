"use client";

import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import type { User } from "firebase/auth";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { LayoutGrid, LogOut, X } from "lucide-react";
import { FaAws } from "react-icons/fa";
import PowerBIDashboard from "./PowerBIDashboard";
import "./LandingPage.css";

const LandingPage = () => {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {
		// Set up auth state listener
		const unsubscribe = auth.onAuthStateChanged((currentUser) => {
			setUser(currentUser);
			setLoading(false);

			// If no user is logged in, redirect to sign in
			if (!currentUser) {
				navigate("/signin");
			}
		});

		// Clean up the listener on component unmount
		return () => unsubscribe();
	}, [navigate]);

	const initiateLogout = () => {
		setShowLogoutConfirm(true);
	};

	const cancelLogout = () => {
		setShowLogoutConfirm(false);
	};

	const confirmLogout = async () => {
		try {
			await signOut(auth);
			console.log("✅ User signed out");
			setShowLogoutConfirm(false);
			navigate("/signin");
		} catch (error) {
			console.error("❌ Logout error:", error);
			setShowLogoutConfirm(false);
		}
	};

	return (
		<>
			{loading ? (
				<div className="loading">Loading...</div>
			) : (
				<div className="dashboard-container">
					{/* Logout Confirmation Modal */}
					{showLogoutConfirm && (
						<div className="modal-overlay">
							<div className="modal-content">
								<div className="modal-header">
									<h3>Confirm Logout</h3>
									<button
										className="modal-close-btn"
										onClick={cancelLogout}
									>
										<X size={20} />
									</button>
								</div>
								<div className="modal-body">
									<p>Are you sure you want to log out?</p>
								</div>
								<div className="modal-footer">
									<button
										className="btn-cancel"
										onClick={cancelLogout}
									>
										Cancel
									</button>
									<button
										className="btn-confirm"
										onClick={confirmLogout}
									>
										Logout
									</button>
								</div>
							</div>
						</div>
					)}

					{/* Sidebar */}
					<aside className="sidebar">
						<div className="sidebar-header">
							<div className="logo-container">
								<div className="logo-circle">IG</div>
								<h2 className="logo-text">InteGreat</h2>
							</div>
						</div>

						<div className="sidebar-section">
							<p className="section-title">MENU</p>
							<ul className="nav-list">
								<li className="nav-item active">
									<LayoutGrid className="nav-icon" />
									<span>Dashboard</span>
								</li>
							</ul>
						</div>

						<div className="sidebar-section">
							<p className="section-title">OTHERS</p>
							<ul className="nav-list">
								<li
									className="nav-item"
									onClick={initiateLogout}
								>
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
								<h2>
									Welcome back
									{user.displayName
										? ", " + user.displayName.split(" ")[0]
										: ""}
									!
								</h2>
								<p>
									You are now signed in to your analytics
									dashboard.
								</p>
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

						{/* AWS Console Link Card */}
						<div className="aws-card">
							<div className="aws-card-content">
								<div className="aws-icon">
									<FaAws size={32} color="#FF9900" />
								</div>
								<div className="aws-text">
									<h3>AWS Management Console</h3>
									<p>
										Access your cloud resources and services
									</p>
								</div>
								<a
									href="https://717279716107.signin.aws.amazon.com/console"
									target="_blank"
									rel="noopener noreferrer"
									className="aws-button"
								>
									Go to Console
								</a>
							</div>
						</div>
					</main>
				</div>
			)}
		</>
	);
};

export default LandingPage;
