import z from 'zod';
import { ID_PREFIX, ksuidRegex } from '../types/types';

export const GetMembersInputSchema = z.object({
  channelId: z.string().regex(ksuidRegex(ID_PREFIX.CHANNEL)),
});

export const InviteToChannelInputSchema = z.object({
  channelId: z.string().regex(ksuidRegex(ID_PREFIX.CHANNEL)),
  memberIds: z.array(z.string().regex(ksuidRegex(ID_PREFIX.USER))).min(1),
});

export const SearchByAliasInputSchema = z.object({
  alias: z.string().min(1).max(32),
  limit: z.number().min(1).max(100).optional(),
});

export type GetMembersInput = z.infer<typeof GetMembersInputSchema>;
export type InviteToChannelInput = z.infer<typeof InviteToChannelInputSchema>;
export type SearchByAliasInput = z.infer<typeof SearchByAliasInputSchema>;
