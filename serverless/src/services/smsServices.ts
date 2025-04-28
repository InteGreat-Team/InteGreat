/**
 * SMS Service
 * 
 * This service handles SMS-related functionality using PHIL SMS API.
 * It provides methods for sending event details via SMS to specified recipients.
 * 
 * Key Components:
 * - PHIL SMS Integration: Uses axios for API communication
 * - Message Formatting: Formats event details into readable SMS content
 * - Transaction Logging: Records SMS sending attempts and results
 * 
 * Features:
 * - Error Handling: Catches and logs API errors appropriately
 * - Formatted Content: Presents event details in structured SMS format
 * - Environment Configuration: Uses validated environment variables
 * - Result Tracking: Returns boolean success/failure result
 * 
 * This service is used by controllers to fulfill SMS-related requests.
 */

// services/smsServices.ts

import { philSmsClient } from '../config/philSms';
import { EventDetails } from '../types/eventTypes';
import { PhilSmsResponse, SmsNotification } from '../types/smsTypes';
import { logTransaction } from './eventServices';

function formatPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0')) return `+63${digits.substring(1)}`;
  if (digits.startsWith('63')) return `+${digits}`;
  if (digits.startsWith('+')) return digits;
  return `+63${digits}`;
}

export async function sendEventNotification(
  event: EventDetails,
  recipientPhone?: string
): Promise<boolean> {
  try {
    if (!recipientPhone) throw new Error('Recipient phone number is required');

    const digits = recipientPhone.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 12) {
      throw new Error('Invalid phone number length');
    }

    const formattedPhone = formatPhoneNumber(recipientPhone);

    const message = `📢 Event Alert: ${event.name}
📅 Date: ${event.date || "Not specified"}
🕒 Time: ${event.start_time || "Not specified"} - ${event.end_time || "Not specified"}
📍 Location: ${event.location || "Not specified"}
📖 Description: ${event.description || "No description available"}`;

    const smsNotification: SmsNotification = {
      recipient: formattedPhone,
      sender_id: 'PhilSMS',
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

    await logTransaction(
      event.event_id,
      "POST",
      "SUCCESS",
      `Notification sent to ${formattedPhone} - Message ID: ${responseData.message_id || 'unknown'}`
    );

    return true;
  } catch (error) {
    console.error("❌ Error sending notification:", error);

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

    await logTransaction(
      event.event_id,
      "POST",
      "ERROR",
      `Notification failed: ${JSON.stringify(detailedError)}`
    );

    throw new Error(JSON.stringify(detailedError));
  }
}
