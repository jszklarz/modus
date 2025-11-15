import { createStore } from "@xstate/store";
import { Message, MessageStatus } from "../channel/types";

export const messageStore = createStore({
  context: {
    channelMessages: {} as Record<string, Message[]>,
  },
  on: {
    setChannelMessages: (context, event: { channelId: string; messages: Message[] }) => ({
      ...context,
      channelMessages: {
        ...context.channelMessages,
        [event.channelId]: event.messages,
      },
    }),
    addChannelMessages: (context, event: { channelId: string; message: Message[] }) => ({
      ...context,
      channelMessages: {
        ...context.channelMessages,
        [event.channelId]: [...(context.channelMessages[event.channelId] || []), ...event.message],
      },
    }),
    updateMessageStatus: (
      context,
      event: { channelId: string; messageId: string; status: MessageStatus }
    ) => ({
      ...context,
      channelMessages: {
        ...context.channelMessages,
        [event.channelId]: (context.channelMessages[event.channelId] || []).map((msg) =>
          msg.id === event.messageId ? { ...msg, status: event.status } : msg
        ),
      },
    }),
    replaceOptimisticMessage: (
      context,
      event: { channelId: string; tempId: string; newMessage: Message }
    ) => ({
      ...context,
      channelMessages: {
        ...context.channelMessages,
        [event.channelId]: (context.channelMessages[event.channelId] || []).map((msg) =>
          msg.id === event.tempId ? event.newMessage : msg
        ),
      },
    }),
    removeMessage: (context, event: { channelId: string; messageId: string }) => ({
      ...context,
      channelMessages: {
        ...context.channelMessages,
        [event.channelId]:
          context.channelMessages[event.channelId]?.filter((msg) => msg.id !== event.messageId) ??
          [],
      },
    }),
  },
});
