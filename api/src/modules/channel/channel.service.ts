import { eq, and, ilike, or } from 'drizzle-orm';
import { channelMembers, channels } from '../../db/schema';
import { ProtectedContext } from '../../trpc';
import {
  CreateChannelInput,
  DeleteChannelInput,
  LeaveChannelInput,
  SearchChannelsInput,
} from './channel.router.types';
import { ProtectedInput } from '../types/types';

export const channelService = {
  getChannelsByUserId: async ({ ctx }: { ctx: ProtectedContext }) => {
    const userId = ctx.auth.userId;

    ctx.logger.info({ userId }, 'Fetching channels for user');

    const result = await ctx.db
      .select({
        id: channels.id,
        name: channels.name,
        isPrivate: channels.isPrivate,
        createdAt: channels.createdAt,
        updatedAt: channels.updatedAt,
      })
      .from(channels)
      .innerJoin(channelMembers, eq(channels.id, channelMembers.channelId))
      .where(eq(channelMembers.userId, userId));

    ctx.logger.info({ userId, count: result.length }, 'Fetched channels for user');
    return result;
  },

  searchChannels: async ({ input, ctx }: ProtectedInput<SearchChannelsInput>) => {
    const userId = ctx.auth.userId;
    const query = input.query.toLowerCase();

    ctx.logger.info({ userId, query }, 'Searching channels');

    // Should search all channels but exclude private channels the user is not a member of
    const result = await ctx.db
      .select()
      .from(channels)
      .innerJoin(channelMembers, eq(channels.id, channelMembers.channelId))
      .where(
        and(
          or(eq(channelMembers.userId, userId), eq(channels.isPrivate, false)),
          ilike(channels.name, `%${query}%`)
        )
      )
      .limit(20);

    ctx.logger.info({ userId, query, count: result.length }, 'Searched channels');
    return result;
  },

  createChannel: async ({ input, ctx }: ProtectedInput<CreateChannelInput>) => {
    const userId = ctx.auth.userId;
    const memberIds = input.memberIds || [];

    // Always include the creator as a member
    if (!memberIds.includes(userId)) {
      memberIds.push(userId);
    }

    ctx.logger.info({ name: input.name, memberCount: memberIds.length }, 'Creating channel');

    try {
      const result = await ctx.db.transaction(async (tx: any) => {
        const newChannel = await tx
          .insert(channels)
          .values({
            name: input.name,
            isPrivate: input.isPrivate,
            orgId: ctx.auth.orgId,
            ownerId: userId,
          })
          .returning();

        const channelMembersToInsert = memberIds.map(memberId => ({
          channelId: newChannel[0].id,
          userId: memberId,
        }));

        await tx.insert(channelMembers).values(channelMembersToInsert);

        return newChannel[0];
      });

      ctx.logger.info({ channelId: result.id, name: result.name }, 'Channel created successfully');
      return result;
    } catch (error) {
      ctx.logger.error({ error, name: input.name }, 'Failed to create channel');
      throw error;
    }
  },

  leaveChannel: async ({ input, ctx }: ProtectedInput<LeaveChannelInput>) => {
    const userId = ctx.auth.userId;
    const channelId = input.channelId;

    ctx.logger.info({ userId, channelId }, 'User leaving channel');

    const deleteResult = await ctx.db
      .delete(channelMembers)
      .where(and(eq(channelMembers.channelId, channelId), eq(channelMembers.userId, userId)));

    ctx.logger.info({ userId, channelId }, 'User left channel successfully');

    return deleteResult;
  },

  deleteChannel: async ({ input, ctx }: ProtectedInput<DeleteChannelInput>) => {
    const userId = ctx.auth.userId;
    const channelId = input.channelId;

    ctx.logger.info({ userId, channelId }, 'Attempting to delete channel');

    // Verify the user is the owner of the channel
    const channel = await ctx.db.select().from(channels).where(eq(channels.id, channelId)).limit(1);

    if (channel.length === 0) {
      ctx.logger.error({ channelId }, 'Channel not found');
      throw new Error('Channel not found');
    }

    if (channel[0].ownerId !== userId) {
      ctx.logger.error({ userId, channelId, ownerId: channel[0].ownerId }, 'User is not the owner');
      throw new Error('Only the channel owner can delete the channel');
    }

    // Delete the channel (cascade will handle channel_members and messages)
    const deleteResult = await ctx.db.delete(channels).where(eq(channels.id, channelId));

    ctx.logger.info({ userId, channelId }, 'Channel deleted successfully');

    return deleteResult;
  },
};
