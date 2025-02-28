import * as nodemailer from 'nodemailer';
import { google } from 'googleapis';
import { EventDetails, logTransaction } from './eventService';
import * as dotenv from 'dotenv';

dotenv.config();

// Google OAuth Credentials
const credentials = {
    clientId: process.env.CLIENT_ID || '',
    clientSecret: process.env.CLIENT_SECRET || '',
    redirectUri: process.env.REDIRECT_URI || '',
    refreshToken: process.env.REFRESH_TOKEN || '',
};

// Initialize OAuth2 Client
const oAuth2Client = new google.auth.OAuth2(
    credentials.clientId,
    credentials.clientSecret,
    credentials.redirectUri
);
oAuth2Client.setCredentials({ refresh_token: credentials.refreshToken });

/**
 * Send event details via email and log the transaction
 */
export async function sendEventEmail(event: EventDetails, recipientEmail: string): Promise<boolean> {
    try {
        const accessToken = await oAuth2Client.getAccessToken();

        // Create Transporter
        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: 'integreatapi@gmail.com', // Replace with your email
                clientId: credentials.clientId,
                clientSecret: credentials.clientSecret,
                refreshToken: credentials.refreshToken,
                accessToken: accessToken.token || '',
            },
        });

        // Format email body
        const mailOptions: nodemailer.SendMailOptions = {
            from: 'INTEGREAT API <integreatapi@gmail.com>',
            to: recipientEmail,
            subject: `Event Details: ${event.name}`,
            html: `
                <h1>Event Details</h1>
                <p><strong>Name:</strong> ${event.name}</p>
                <p><strong>Date:</strong> ${event.date}</p>
                <p><strong>Start Time:</strong> ${event.start_time}</p>
                <p><strong>End Time:</strong> ${event.end_time}</p>
                <p><strong>Location:</strong> ${event.location}</p>
                <p><strong>Description:</strong> ${event.description}</p>
            `,
        };

        // Send Email
        await transport.sendMail(mailOptions);
        console.log('Email sent successfully');

        // Log success transaction
        await logTransaction(event.event_id, 'POST', 'SUCCESS', `Email sent to ${recipientEmail}`);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        
        // Log failed transaction
        const errorMessage = (error as Error).message;
        await logTransaction(event.event_id, 'POST', 'ERROR', `Email failed to send: ${errorMessage}`);
        return false;
    }
}