/**
 * SMS Types
 * 
 * This file contains TypeScript interfaces for SMS-related data structures.
 */

export interface SmsNotification {
  recipient: string;
  sender_id: string;
  type: 'plain' | 'unicode'; // if supported
  message: string;
}

export interface PhilSmsResponse {
  status: string;
  message_id?: string;
  error?: any;
  data?: any;
}