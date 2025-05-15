export interface SmsNotification {
  recipient: string;
  sender_id: string;
  type: 'plain' | 'unicode';
  message: string;
}

export interface PhilSmsResponse {
  status: string;
  message_id?: string;
  error?: any;
  data?: any;
} 