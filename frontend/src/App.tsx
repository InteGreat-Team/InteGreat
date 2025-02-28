import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SendEmailPage from './pages/SendEmailPage';
import './index.css'; // Ensure this is imported

function App() {
    return (
        <Router>
            <div className="container">
                <h1>🎉 Event API Portal</h1>
                <nav>
                    <Link to="/">View Events</Link> | <Link to="/send-email">Send Event Details</Link>
                </nav>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/send-email" element={<SendEmailPage />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
