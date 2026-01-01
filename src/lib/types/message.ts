export type MessageStatus = 
  | 'pending'
  | 'sent'
  | 'delivered'
  | 'failed';

export type MessageChannel = 
  | 'email'
  | 'platform_api'
  | 'whatsapp';

export interface Message {
  id: string;
  user_id: string;
  property_id: string;
  
  // Message content
  subject: string;
  body: string;
  
  // Recipient
  recipient_name: string | null;
  recipient_email: string | null;
  recipient_phone: string | null;
  
  // Delivery
  channel: MessageChannel;
  status: MessageStatus;
  sent_at: string | null;
  delivered_at: string | null;
  error_message: string | null;
  
  // Metadata
  created_at: string;
  updated_at: string;
}

export interface MessageTemplate {
  id: string;
  user_id: string;
  name: string;
  subject: string;
  body: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

