import { and, desc, eq, lt } from 'drizzle-orm';
import { channelMembers, messages } from '../../db/schema';

export const messageService = {
  // Fetches the messages from a channel based on the given cursor (messageId).
  // Orders by createdAt descending (youngest -> oldest)
  getMessagesByChannelId: async ({
    input,
    ctx,
  }: {
    input: { channelId: string; latestMessageId?: string; limit?: number };
    ctx: any;
  }) => {
    const { channelId, latestMessageId, limit = 20 } = input;

    ctx.logger.info({ channelId, latestMessageId, limit }, 'Fetching messages');

    // First page - no cursor
    if (!latestMessageId) {
      const result = await ctx.db
        .select()
        .from(messages)
        .where(eq(messages.channelId, channelId))
        .orderBy(desc(messages.createdAt))
        .limit(limit);

      ctx.logger.info({ count: result.length }, 'Fetched messages (first page)');
      return result;
    }

    // If we have a cursor, fetch the timestamp of that message first
    const cursorMessage = await ctx.db
      .select({ createdAt: messages.createdAt })
      .from(messages)
      .where(eq(messages.id, latestMessageId))
      .limit(1);

    if (!cursorMessage.length) {
      ctx.logger.error({ latestMessageId }, 'Invalid cursor: message not found');
      throw new Error('Invalid latestMessageId cursor');
    }

    // Fetch messages older than the cursor message
    const result = await ctx.db
      .select()
      .from(messages)
      .where(
        and(eq(messages.channelId, channelId), lt(messages.createdAt, cursorMessage[0].createdAt))
      )
      .orderBy(desc(messages.createdAt))
      .limit(limit);

    ctx.logger.info({ count: result.length }, 'Fetched messages (paginated)');
    return result;
  },

  // Posts a new message to the given channel
  createMessage: async ({
    input,
    ctx,
  }: {
    input: { channelId: string; content: string; userId: string };
    ctx: any;
  }) => {
    // First confirm that the userId is a member of the channel.
    const member = await ctx.db
      .select()
      .from(channelMembers)
      .where(
        and(eq(channelMembers.channelId, input.channelId), eq(channelMembers.userId, input.userId))
      )
      .limit(1);

    // If not a member, throw an error
    if (member.length === 0) {
      throw new Error('User is not a member of the channel');
    }

    // Insert the message
    return ctx.db
      .insert(messages)
      .values({
        channelId: input.channelId,
        content: input.content,
        userId: 'test-user-id',
      })
      .returning();
  },
};
