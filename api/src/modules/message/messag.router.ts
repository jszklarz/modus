import z from 'zod';
import { publicProcedure } from '../../trpc';
import { channelService } from '../channel/channel.service';
import { messageService } from './message.service';

export const messageRouter = {
  getMessages: publicProcedure
    .input(
      z.object({
        channelId: z.string(),
        latestMessageId: z.string().optional(),
        limit: z.number().min(1).max(100).optional(),
      })
    )
    .query(messageService.getMessagesByChannelId),
  postMessage: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        channelId: z.string(),
        content: z.string().min(1).max(1000),
      })
    )
    .mutation(messageService.createMessage),
};
