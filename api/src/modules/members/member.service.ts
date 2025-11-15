import { eq, and, ilike } from 'drizzle-orm';
import { channelMembers, orgMembers, userProfiles } from '../../db/schema';
import { ProtectedInput } from '../types/types';
import { GetMembersInput, InviteToChannelInput, SearchByAliasInput } from './member.router.types';
import { ProtectedContext } from '../../trpc';

export const memberService = {
  getOrgMembers: async ({ ctx }: { ctx: ProtectedContext }) => {
    const { userId, orgId } = ctx.auth;

    if (!orgId) {
      ctx.logger.error({ userId }, 'No organization ID found');
      throw new Error('User is not in an organization');
    }

    ctx.logger.info({ userId, orgId }, 'Fetching organization me  mbers');

    return ctx.db.select().from(orgMembers).where(eq(orgMembers.orgId, orgId));
  },

  getChannelMembers: async ({ input, ctx }: ProtectedInput<GetMembersInput>) => {
    const userId = ctx.auth.userId;
    const channelId = input.channelId;

    ctx.logger.info({ userId, channelId }, 'Fetching channel members');

    const result = await ctx.db
      .select({
        userId: channelMembers.userId,
      })
      .from(channelMembers)
      .where(eq(channelMembers.channelId, channelId));

    ctx.logger.info({ userId, channelId, count: result.length }, 'Fetched channel members');
    return result.map(r => r.userId);
  },

  /**
   * Search members by alias within the user's organization
   */
  searchMembersByAlias: async ({ input, ctx }: ProtectedInput<SearchByAliasInput>) => {
    const { userId, orgId } = ctx.auth;

    if (!orgId) {
      ctx.logger.error({ userId }, 'No organization ID found');
      throw new Error('User is not in an organization');
    }

    const { alias, limit = 20 } = input;

    ctx.logger.info({ userId, orgId, alias }, 'Searching members by alias');

    // Org-scoped alias search using join
    const results = await ctx.db
      .select({
        userId: userProfiles.userId,
        alias: userProfiles.alias,
      })
      .from(userProfiles)
      .innerJoin(orgMembers, eq(userProfiles.userId, orgMembers.userId))
      .where(and(eq(orgMembers.orgId, orgId), ilike(userProfiles.alias, `%${alias}%`)))
      .limit(limit);

    ctx.logger.info({ userId, orgId, alias, count: results.length }, 'Found members by alias');

    return results;
  },

  inviteToChannel: async ({ input, ctx }: ProtectedInput<InviteToChannelInput>) => {
    const userId = ctx.auth.userId;
    const channelId = input.channelId;
    const memberIds = input.memberIds;

    ctx.logger.info({ userId, channelId, memberIds }, 'Inviting members to channel');

    const insertData = memberIds.map(memberId => ({
      channelId,
      userId: memberId,
    }));

    await ctx.db.insert(channelMembers).values(insertData);

    ctx.logger.info({ userId, channelId, memberIds }, 'Invited members to channel');
  },
};
