export interface User {
  id: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string;
  emailAddress: string;
}

export type MessageStatus = 'pending' | 'sent' | 'error';

export interface Message {
  id: string;
  channelId: string;
  userId: string;
  content: string;
  createdAt: Date | string;
  user: User;
  status?: MessageStatus; // Optional for backward compatibility with server messages
}
