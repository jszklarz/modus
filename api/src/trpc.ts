import { initTRPC, TRPCError } from '@trpc/server';
import { and, eq } from 'drizzle-orm';
import { db } from './db';
import { orgMembers } from './db/schema';
import { logger } from './common/logger';
import type { Logger } from 'pino';
import { getAuth } from '@clerk/express';
import { clerkClient } from './common/clerk';

/**
 * Context type for tRPC procedures
 */
export type Context = {
  db: typeof db;
  logger: Logger;
  auth: any;
};

/**
 * Protected context type with guaranteed auth
 */
export type ProtectedContext = Context & {
  auth: ReturnType<typeof getAuth>;
};

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.context<Context>().create({
  errorFormatter({ shape, error }) {
    // Log all errors
    logger.error(
      {
        code: error.code,
        cause: error.cause,
        path: shape.data?.path,
      },
      `tRPC Error: ${error.message}`
    );

    return shape;
  },
});

/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router;
export const publicProcedure = t.procedure;

/**
 * Protected procedure that requires authentication
 * Ensures ctx.auth is not null and has userId
 */
export const protectedProcedure = t.procedure.use(async ({ input, ctx, next }) => {
  if (!ctx.auth?.userId || !ctx.auth?.orgId) {
    console.log('Required authentication missing', ctx.auth);
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Not authenticated',
    });
  }

  const { userId, orgId } = ctx.auth;

  const existingMember = await db
    .select()
    .from(orgMembers)
    .where(and(eq(orgMembers.userId, userId), eq(orgMembers.orgId, orgId)))
    .limit(1);

  // If member exists, proceed
  if (existingMember.length > 0) {
    return next({ input, ctx });
  }

  logger.info({ userId, orgId }, 'User not found in org_members, syncing from Clerk');

  const memberships = await clerkClient.organizations.getOrganizationMembershipList({
    organizationId: orgId,
  });

  const members = memberships.data.map(membership => ({
    orgId,
    userId: membership.publicUserData!.userId,
  }));

  if (members.length > 0) {
    await db.insert(orgMembers).values(members).onConflictDoNothing();
    logger.info({ userId, orgId, count: members.length }, 'Synced org members from Clerk');
  }

  return next({ input, ctx });
});
