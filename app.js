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
            return null; // No event found
        }

        return result.rows[0];

    } catch (error) {
        console.error("Error fetching event:", error);
        return null;
    }
}

async function logTransaction(userEmail, eventId, status, responseMessage) {
    try {
        const query = `
            INSERT INTO transactions (user_email, event_id, status, response_message, created_at)
            VALUES ($1, $2, $3, $4, NOW())
            RETURNING id;
        `;
        const values = [userEmail, eventId, status, responseMessage];

        const result = await pool.query(query, values);
        console.log(`Transaction logged with ID: ${result.rows[0].id}`);
    } catch (error) {
        console.error("Error logging transaction:", error);
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

        // Fetch event details
        const event = await getEventDetails(eventId);

        if (!event) {
            await logTransaction(recipientEmail, eventId, 'FAILED', 'Event not found.');
            return console.log("Event not found, transaction logged.");
        }

        // Format event details
        const eventDetails = `
            <h2>Event Details</h2>
            <p><strong>Event:</strong> ${event.event_name}</p>
            <p><strong>Date:</strong> ${event.event_date}</p>
            <p><strong>Start Time:</strong> ${event.start_time}</p>
            <p><strong>End Time:</strong> ${event.end_time}</p>
            <p><strong>Location:</strong> ${event.location}</p>
            <p><strong>Description:</strong> ${event.description || 'No description available'}</p>
        `;

        // Email options
        const mailOptions = {
            from: 'your-email@example.com', // Replace with your email
            to: recipientEmail,
            subject: 'Event Details',
            html: eventDetails,
        };

        const result = await transport.sendMail(mailOptions);
        console.log('Email sent successfully.');

        // Log successful transaction
        await logTransaction(recipientEmail, eventId, 'SUCCESS', 'Email sent successfully.');
        return result;
        
    } catch (error) {
        console.error('Error sending email:', error);

        // Log failed transaction
        await logTransaction(recipientEmail, eventId, 'FAILED', error.message);
        return error;
    }
}

// Example Usage
const eventId = 1; // Change this to fetch a specific event
const recipientEmail = 'recipient@example.com'; // Replace with actual recipient email

sendMail(eventId, recipientEmail)
    .then(result => console.log('Process completed:', result))
    .catch(error => console.log('Error:', error.message));
