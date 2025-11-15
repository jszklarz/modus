import { EventEmitter } from 'events';

interface User {
  id: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string;
  emailAddress: string;
}

interface Message {
  id: string;
  channelId: string;
  userId: string;
  content: string;
  createdAt: Date;
  user: User;
}

interface MessageEvents {
  messageAdded: (message: Message) => void;
}

// Typed event emitter for message events
class TypedEventEmitter extends EventEmitter {
  emit<K extends keyof MessageEvents>(
    event: K,
    ...args: Parameters<MessageEvents[K]>
  ): boolean {
    return super.emit(event, ...args);
  }

  on<K extends keyof MessageEvents>(
    event: K,
    listener: MessageEvents[K]
  ): this {
    return super.on(event, listener);
  }

  off<K extends keyof MessageEvents>(
    event: K,
    listener: MessageEvents[K]
  ): this {
    return super.off(event, listener);
  }
}

export const messageEmitter = new TypedEventEmitter();
export type { Message, User };
