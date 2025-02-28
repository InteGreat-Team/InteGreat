const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const { Pool } = require('pg');

// OAuth2 Credentials
const CLIENT_ID = '';
const CLIENT_SECRET = '';
const REDIRECT_URI = '';
const REFRESH_TOKEN = '';

// PostgreSQL Database Configuration
const pool = new Pool({
    user: 'your_db_user',
    host: 'your_db_host',
    database: 'your_db_name',
    password: 'your_db_password',
    port: 5432, // Default PostgreSQL port
});

// Initialize Google OAuth2 Client
const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

async function getEventDetails(eventId) {
    try {
        const query = 'SELECT event_name, event_date, start_time, end_time, location, description FROM events WHERE id = $1';
        const result = await pool.query(query, [eventId]);

        if (result.rows.length === 0) {
            return "Event not found.";
        }

        const event = result.rows[0];

        // Format the event details for email
        const eventDetails = `
            <h2>Event Details</h2>
            <p><strong>Event:</strong> ${event.event_name}</p>
            <p><strong>Date:</strong> ${event.event_date}</p>
            <p><strong>Start Time:</strong> ${event.start_time}</p>
            <p><strong>End Time:</strong> ${event.end_time}</p>
            <p><strong>Location:</strong> ${event.location}</p>
            <p><strong>Description:</strong> ${event.description || 'No description available'}</p>
        `;

        return eventDetails;

    } catch (error) {
        console.error("Error fetching event:", error);
        return "Error fetching event details.";
    }
}

async function sendMail(eventId, recipientEmail) {
    try {
        const accessToken = await oAuth2Client.getAccessToken();

        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: 'your-email@example.com', // Replace with your email
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: accessToken,
            },
        });

        // Fetch event details from PostgreSQL
        const eventDetails = await getEventDetails(eventId);

        const mailOptions = {
            from: 'your-email@example.com', // Replace with your email
            to: recipientEmail,
            subject: 'Event Details',
            html: eventDetails,
        };

        const result = await transport.sendMail(mailOptions);
        console.log('Email sent...', result);
        return result;
    } catch (error) {
        console.error('Error sending email:', error);
        return error;
    }
}

// Example Usage: Send event details for event ID 1 to a recipient
const eventId = 1; // Change this to fetch a specific event from DB
const recipientEmail = 'recipient@example.com'; // Replace with actual recipient

sendMail(eventId, recipientEmail)
    .then(result => console.log('Email sent successfully:', result))
    .catch(error => console.log('Error:', error.message));
