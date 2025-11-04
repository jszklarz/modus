import { eq, and, ilike, or } from 'drizzle-orm';
import { channelMembers, channels } from '../../db/schema';
import { ProtectedContext } from '../../trpc';

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
  searchChannels: async ({ input, ctx }: { input: { query: string }; ctx: ProtectedContext }) => {
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
  createChannel: async ({
    input,
    ctx,
  }: {
    input: { name: string; isPrivate: boolean; memberIds?: string[] };
    ctx: ProtectedContext;
  }) => {
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
};
