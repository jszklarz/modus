import { and, desc, eq, lt } from 'drizzle-orm';
import { channelMembers, messages } from '../../db/schema';
import { ProtectedContext } from '../../trpc';
import { messageEmitter } from '../../common/events';
import { clerkClient } from '../../common/clerk';

export const messageService = {
  // Fetches the messages from a channel based on the given cursor (messageId).
  // Orders by createdAt descending (youngest -> oldest)
  getMessagesByChannelId: async ({
    input,
    ctx,
  }: {
    input: { channelId: string; latestMessageId?: string; limit?: number };
    ctx: ProtectedContext;
  }) => {
    const { channelId, latestMessageId, limit = 20 } = input;

    ctx.logger.info({ channelId, latestMessageId, limit }, 'Fetching messages');

    let result;

    // First page - no cursor
    if (!latestMessageId) {
      result = await ctx.db
        .select()
        .from(messages)
        .where(eq(messages.channelId, channelId))
        .orderBy(desc(messages.createdAt))
        .limit(limit);

      ctx.logger.info({ count: result.length }, 'Fetched messages (first page)');
    } else {
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
      result = await ctx.db
        .select()
        .from(messages)
        .where(
          and(eq(messages.channelId, channelId), lt(messages.createdAt, cursorMessage[0].createdAt))
        )
        .orderBy(desc(messages.createdAt))
        .limit(limit);

      ctx.logger.info({ count: result.length }, 'Fetched messages (paginated)');
    }

    // Enrich messages with user data from Clerk
    const enrichedMessages = await Promise.all(
      result.map(async (message) => {
        try {
          const user = await clerkClient.users.getUser(message.userId);
          const userEmail = user.emailAddresses.find((email) => email.id === user.primaryEmailAddressId);

          return {
            ...message,
            user: {
              id: user.id,
              firstName: user.firstName,
              lastName: user.lastName,
              imageUrl: user.imageUrl,
              emailAddress: userEmail?.emailAddress || '',
            },
          };
        } catch (error) {
          ctx.logger.error({ error, userId: message.userId }, 'Failed to fetch user data from Clerk');
          // Return message with placeholder user data
          return {
            ...message,
            user: {
              id: message.userId,
              firstName: null,
              lastName: null,
              imageUrl: '',
              emailAddress: 'unknown@example.com',
            },
          };
        }
      })
    );

    return enrichedMessages;
  },

  // Posts a new message to the given channel
  createMessage: async ({
    input,
    ctx,
  }: {
    input: { channelId: string; content: string };
    ctx: ProtectedContext;
  }) => {
    const userId = ctx.auth.userId;

    // First confirm that the userId is a member of the channel.
    const member = await ctx.db
      .select()
      .from(channelMembers)
      .where(
        and(eq(channelMembers.channelId, input.channelId), eq(channelMembers.userId, userId))
      )
      .limit(1);

    // If not a member, throw an error
    if (member.length === 0) {
      throw new Error('User is not a member of the channel');
    }

    // Insert the message
    const result = await ctx.db
      .insert(messages)
      .values({
        channelId: input.channelId,
        content: input.content,
        userId: userId,
      })
      .returning();

    // Emit event for real-time updates
    if (result.length > 0) {
      const newMessage = result[0];

      // Fetch user data from Clerk
      try {
        const user = await clerkClient.users.getUser(userId);
        const userEmail = user.emailAddresses.find((email) => email.id === user.primaryEmailAddressId);

        // Emit message with user data
        messageEmitter.emit('messageAdded', {
          ...newMessage,
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            imageUrl: user.imageUrl,
            emailAddress: userEmail?.emailAddress || '',
          },
        });

        ctx.logger.info({ messageId: newMessage.id, channelId: newMessage.channelId }, 'Message created and event emitted with user data');
      } catch (error) {
        ctx.logger.error({ error, userId }, 'Failed to fetch user data from Clerk');
        // Still emit the message without user data as fallback
        messageEmitter.emit('messageAdded', newMessage as any);
      }
    }

    return result;
  },
};
