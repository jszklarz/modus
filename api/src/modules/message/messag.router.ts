import z from 'zod';
import { protectedProcedure } from '../../trpc';
import { messageService } from './message.service';

export const messageRouter = {
  getMessages: protectedProcedure
    .input(
      z.object({
        channelId: z.string(),
        latestMessageId: z.string().optional(),
        limit: z.number().min(1).max(100).optional(),
      })
    )
    .query(messageService.getMessagesByChannelId),
  postMessage: protectedProcedure
    .input(
      z.object({
        channelId: z.string(),
        content: z.string().min(1).max(1000),
      })
    )
    .mutation(messageService.createMessage),
};
