import z from 'zod';
import { ID_PREFIX, ksuidRegex } from '../types/types';

export const CreateChannelInputSchema = z.object({
  name: z.string().min(1).max(32),
  isPrivate: z.boolean(),
  memberIds: z.array(z.string()).optional(),
});

export const LeaveChannelInputSchema = z.object({
  channelId: z.string().regex(ksuidRegex(ID_PREFIX.CHANNEL)),
});

export const SearchChannelsInputSchema = z.object({
  query: z.string().min(1).max(32),
});

export const DeleteChannelInputSchema = z.object({
  channelId: z.string().regex(ksuidRegex(ID_PREFIX.CHANNEL)),
});

export type CreateChannelInput = z.infer<typeof CreateChannelInputSchema>;
export type LeaveChannelInput = z.infer<typeof LeaveChannelInputSchema>;
export type SearchChannelsInput = z.infer<typeof SearchChannelsInputSchema>;
export type DeleteChannelInput = z.infer<typeof DeleteChannelInputSchema>;
