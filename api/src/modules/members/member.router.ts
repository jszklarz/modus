import { protectedProcedure } from '../../trpc';
import {
  GetMembersInputSchema,
  InviteToChannelInputSchema,
  SearchByAliasInputSchema,
} from './member.router.types';
import { memberService } from './member.service';

export const memberRouter = {
  getMembers: protectedProcedure
    .input(GetMembersInputSchema)
    .query(memberService.getChannelMembers),

  inviteToChannel: protectedProcedure
    .input(InviteToChannelInputSchema)
    .mutation(memberService.inviteToChannel),

  searchByAlias: protectedProcedure
    .input(SearchByAliasInputSchema)
    .query(memberService.searchMembersByAlias),
};
