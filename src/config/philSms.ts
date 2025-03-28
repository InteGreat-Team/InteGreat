/**
 * PHIL SMS Configuration
 * 
 * This file configures the PHIL SMS client for sending SMS notifications.
 * It uses environment variables for authentication and configuration.
 */

import axios from 'axios';
import { env } from './env';

// PHIL SMS API configuration
const philSmsConfig = {
  baseURL: env.PHIL_SMS_API_URL,
  apiKey: env.PHIL_SMS_API_KEY,
};

// Create and export axios instance for PHIL SMS API
export const philSmsClient = axios.create({
  baseURL: philSmsConfig.baseURL,
  headers: {
    'Authorization': `Bearer ${philSmsConfig.apiKey}`,
    'Content-Type': 'application/json',
  },
}); 