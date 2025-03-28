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

import { philSmsClient } from "../config/philSms";
import { EventDetails } from "../types/eventTypes";
import { logTransaction } from "./eventServices";

/**
 * Send event details via SMS to a specified recipient
 * 
 * @param event - Event details object containing all event information
 * @param recipientPhone - Phone number of the recipient
 * @returns Promise<boolean> - True if SMS was sent successfully, false otherwise
 */
export async function sendEventNotification(
  event: EventDetails,
  recipientPhone?: string,
): Promise<boolean> {
  try {
    console.log(`📢 Sending event notification for: ${event.name}`);

    const message = `📢 Event Alert: ${event.name}\n📅 Date: ${
      event.date || "Not specified"
    }\n🕒 Time: ${event.start_time || "Not specified"} - ${
      event.end_time || "Not specified"
    }\n📍 Location: ${
      event.location || "Not specified"
    }\n📖 Description: ${event.description || "No description available"}`;

    // Send SMS using PHIL SMS API
    const response = await philSmsClient.post('/send', {
      phone_number: recipientPhone,
      message: message,
    });

    console.log("✅ Notification sent successfully", response.data);

    await logTransaction(event.event_id, "POST", "SUCCESS", `Notification sent`);

    return true;
  } catch (error) {
    console.error("❌ Error sending notification:", error);
    const errorMessage = (error as Error).message;

    await logTransaction(event.event_id, "POST", "ERROR", `Notification failed: ${errorMessage}`);

    return false;
  }
} 