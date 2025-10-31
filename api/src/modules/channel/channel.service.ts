import { eq, inArray } from 'drizzle-orm';
import { Channel, ChannelMember, channelMembers, channels } from '../../db/schema';

export const channelService = {
  getChannelsByUserId: async ({ input, ctx }: { input: { userId: string }; ctx: any }) => {
    ctx.logger.info({ userId: input.userId }, 'Fetching channels for user');

    const result = await ctx.db
      .select({
        id: channels.id,
        name: channels.name,
        createdAt: channels.createdAt,
        updatedAt: channels.updatedAt,
      })
      .from(channels)
      .innerJoin(channelMembers, eq(channels.id, channelMembers.channelId))
      .where(eq(channelMembers.userId, input.userId));

    ctx.logger.info({ userId: input.userId, count: result.length }, 'Fetched channels for user');
    return result;
  },
  createChannel: async ({ input, ctx }: { input: { name: string; memberIds: string[] }; ctx: any }) => {
    ctx.logger.info({ name: input.name, memberCount: input.memberIds.length }, 'Creating channel');

    try {
      const result = await ctx.db.transaction(async (tx: any) => {
        const newChannel = await tx
          .insert(channels)
          .values({ name: input.name })
          .returning();

        const channelMembersToInsert = input.memberIds.map((userId) => ({
          channelId: newChannel[0].id,
          userId,
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
};
