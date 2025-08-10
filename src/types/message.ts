export interface Message {
  _id?: string;
  id: string;
  from: string;
  to: string;
  timestamp: number;
  text: string;
  type: 'text' | 'image' | 'document' | 'audio' | 'video';
  contact_name: string;
  wa_id: string;
  status: 'sent' | 'delivered' | 'read';
  statusTimestamp?: number;
  createdAt: Date;
  isIncoming: boolean;
}

export interface Conversation {
  wa_id: string;
  contact_name: string;
  lastMessage: Message;
  unreadCount: number;
  messages: Message[];
}

export interface WebhookPayload {
  payload_type: string;
  _id: string;
  metaData: {
    entry: Array<{
      changes: Array<{
        field: string;
        value: {
          contacts?: Array<{
            profile: {
              name: string;
            };
            wa_id: string;
          }>;
          messages?: Array<{
            from: string;
            id: string;
            timestamp: string;
            text?: {
              body: string;
            };
            type: string;
          }>;
          statuses?: Array<{
            id: string;
            meta_msg_id?: string;
            recipient_id: string;
            status: 'sent' | 'delivered' | 'read';
            timestamp: string;
          }>;
          messaging_product: string;
          metadata: {
            display_phone_number: string;
            phone_number_id: string;
          };
        };
      }>;
      id: string;
    }>;
    gs_app_id: string;
    object: string;
  };
  createdAt: string;
  startedAt: string;
  completedAt: string;
  executed: boolean;
}