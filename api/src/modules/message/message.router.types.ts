import z from 'zod';

export const GetMessagesInputSchema = z.object({
  channelId: z.string(),
  latestMessageId: z.string().optional(),
  limit: z.number().min(1).max(100).optional(),
});

export const PostMessageInputSchema = z.object({
  channelId: z.string(),
  content: z.string().min(1).max(1000),
});

export const OnMessageAddedInputSchema = z.object({
  orgId: z.string(),
});
