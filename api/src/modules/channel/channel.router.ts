import { z } from 'zod';
import { publicProcedure } from '../../trpc';
import { channelService } from './channel.service';
import { create } from 'domain';

export const channelRouter = {
  getChannels: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(channelService.getChannelsByUserId),
  createChannel: publicProcedure
    .input(
      z.object({
        name: z.string().min(1).max(32),
        memberIds: z.array(z.string()),
      })
    )
    .mutation(channelService.createChannel),
};
