/**
 * SMS Service
 * 
 * This service handles SMS-related functionality using the PHIL SMS API.
 * It provides a general-purpose method for sending SMS messages to recipients.
 * 
 * Key Components:
 * - PHIL SMS Integration: Uses Axios for API communication
 * - Phone Number Formatting: Ensures proper international format
 * 
 * Features:
 * - Error Handling: Catches and logs API errors appropriately
 * - Phone Validation: Ensures valid phone number format
 * - Result Tracking: Returns boolean success/failure result
 * 
 * This service provides a reliable way to send any SMS notification,
 * with proper error handling for debugging purposes.
 */

import axios from 'axios';
import { PhilSmsResponse, SmsNotification } from '../types/smsTypes';

const philSmsClient = axios.create({
  baseURL: process.env.PHIL_SMS_API_URL,
  headers: {
    'Authorization': `Bearer ${process.env.PHIL_SMS_API_KEY}`,
    'Content-Type': 'application/json'
  }
});

/**
 * Format phone number to international format
 * @param phone Phone number to format
 * @returns Formatted phone number
 */
function formatPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0')) return `+63${digits.substring(1)}`;
  if (digits.startsWith('63')) return `+${digits}`;
  if (digits.startsWith('+')) return digits;
  return `+63${digits}`;
}

/**
 * General purpose function to send an SMS to a recipient
 * 
 * @param recipientPhone - Phone number of the recipient
 * @param message - SMS message content
 * @param senderId - Optional sender ID (defaults to 'PhilSMS')
 * @returns Promise<boolean> - True if SMS was sent successfully
 */
export async function sendSms(
  recipientPhone: string,
  message: string,
  senderId: string = 'PhilSMS'
): Promise<boolean> {
  try {
    if (!recipientPhone) throw new Error('Recipient phone number is required');
    if (!message || message.trim() === '') throw new Error('Message content is required');

    const digits = recipientPhone.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 12) {
      throw new Error('Invalid phone number length');
    }

    const formattedPhone = formatPhoneNumber(recipientPhone);

    const smsNotification: SmsNotification = {
      recipient: formattedPhone,
      sender_id: senderId,
      type: 'plain',
      message,
    };

    const response = await philSmsClient.post<PhilSmsResponse>('/sms/send', smsNotification);
    const responseData = response.data;

    if (!responseData || responseData.status !== 'success') {
      const errorDetails = {
        status: responseData?.status,
        error: responseData?.error,
        data: responseData?.data,
        apiResponse: responseData,
      };
      throw new Error(`API returned non-success status: ${JSON.stringify(errorDetails)}`);
    }

    console.log(`✅ SMS sent successfully to ${formattedPhone} - Message ID: ${responseData.message_id || 'unknown'}`);
    return true;
  } catch (error) {
    console.error("❌ Error sending SMS:", error);

    const errorMessage = (error as Error).message;
    const apiError = (error as any)?.response?.data;
    const apiStatus = (error as any)?.response?.status;
    const apiStatusText = (error as any)?.response?.statusText;
    const apiConfig = (error as any)?.config;

    const detailedError = {
      message: errorMessage,
      apiStatus,
      apiStatusText,
      apiError,
      requestConfig: {
        url: apiConfig?.url,
        method: apiConfig?.method,
        headers: apiConfig?.headers,
        data: apiConfig?.data,
      },
    };

    console.error("❌ Detailed error:", detailedError);
    return false;
  }
}