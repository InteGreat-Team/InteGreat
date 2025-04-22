/**
 * PHIL SMS Configuration
 * 
 * This file configures the PHIL SMS client for sending SMS notifications.
 * It uses environment variables for authentication and configuration.
 */

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export const philSmsClient = axios.create({
  baseURL: 'https://app.philsms.com/api/v3',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.PHIL_SMS_API_KEY}`,
  },
});