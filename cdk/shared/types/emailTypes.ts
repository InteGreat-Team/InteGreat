export interface EmailOptions {
  to: string | string[];
  subject: string;
  text: string; //Plain text body
  html: string; //HTML body
  cc?: string | string[]; // Optional CC field
  bcc?: string | string[]; // Optional BCC field
  attachments?: EmailAttachement[]; // Optional attachments
}

export interface EmailAttachement {
  filename: string;
  content: Buffer | string;
  contentType?: string;
}
