import { useState } from 'react';
import axios from 'axios';
import './SendEmailPage.css'; // Import the new CSS

const API_BASE_URL = 'http://localhost:3000'; // Ensure this is correct

function SendEmailPage() {
    const [eventId, setEventId] = useState('');
    const [recipientEmail, setRecipientEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSendEmail = async () => {
        if (!eventId || !recipientEmail) {
            setMessage('❌ Please fill in all fields.');
            return;
        }

        try {
            const response = await axios.post(`${API_BASE_URL}/send-email`, {
                eventId: parseInt(eventId, 10),
                recipientEmail
            });

            setMessage(`✅ ${response.data.message}`);
        } catch (error) {
            console.error('❌ Error sending email:', error);
            setMessage('❌ Failed to send email.');
        }
    };

    return (
        <div className="container">
            <h2>📧 Send Event Details via Email</h2>
            <div className="form-group">
                <label>Event ID:</label>
                <input
                    type="number"
                    value={eventId}
                    onChange={(e) => setEventId(e.target.value)}
                    placeholder="Enter Event ID"
                />
            </div>

            <div className="form-group">
                <label>Recipient Email:</label>
                <input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="Enter recipient's email"
                />
            </div>

            <button onClick={handleSendEmail}>📩 Send Email</button>

            {message && <p className="message">{message}</p>}
        </div>
    );
}

export default SendEmailPage;
