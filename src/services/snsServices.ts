import { PublishCommand } from "@aws-sdk/client-sns";
import { snsClient } from "../config/aws";
import { EventDetails } from "../types/eventTypes";
import { logTransaction } from "./eventServices";
import { env } from "../config/env"; // Import validated env

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

    const command = new PublishCommand({
      Message: message,
      PhoneNumber: recipientPhone, // For SMS
    });

    const response = await snsClient.send(command);
    console.log("✅ Notification sent successfully", response);

    await logTransaction(event.event_id, "POST", "SUCCESS", `Notification sent`);

    return true;
  } catch (error) {
    console.error("❌ Error sending notification:", error);
    const errorMessage = (error as Error).message;

    await logTransaction(event.event_id, "POST", "ERROR", `Notification failed: ${errorMessage}`);

    return false;
  }
}
