import { protectedProcedure } from '../../trpc';
import {
  CreateChannelInputSchema,
  DeleteChannelInputSchema,
  LeaveChannelInputSchema,
  SearchChannelsInputSchema,
} from './channel.router.types';
import { channelService } from './channel.service';

export const channelRouter = {
  getChannels: protectedProcedure.query(channelService.getChannelsByUserId),

  searchChannels: protectedProcedure
    .input(SearchChannelsInputSchema)
    .query(channelService.searchChannels),

  createChannel: protectedProcedure
    .input(CreateChannelInputSchema)
    .mutation(channelService.createChannel),

  leaveChannel: protectedProcedure
    .input(LeaveChannelInputSchema)
    .mutation(channelService.leaveChannel),

  deleteChannel: protectedProcedure
    .input(DeleteChannelInputSchema)
    .mutation(channelService.deleteChannel),
};
