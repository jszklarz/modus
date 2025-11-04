import { z } from 'zod';
import { protectedProcedure } from '../../trpc';
import { channelService } from './channel.service';

export const channelRouter = {
  getChannels: protectedProcedure.query(channelService.getChannelsByUserId),
  searchChannels: protectedProcedure
    .input(
      z.object({
        query: z.string().min(1).max(32),
      })
    )
    .query(channelService.searchChannels),
  createChannel: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(32),
        isPrivate: z.boolean(),
        memberIds: z.array(z.string()).optional(),
      })
    )
    .mutation(channelService.createChannel),
};
