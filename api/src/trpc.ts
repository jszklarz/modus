import { initTRPC, TRPCError } from '@trpc/server';
import { db } from './db';
import { logger } from './common/logger';
import type { Logger } from 'pino';
import { getAuth } from '@clerk/express';

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
export const protectedProcedure = t.procedure.use(({ input, ctx, next }) => {
  if (!ctx.auth?.userId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Not authenticated',
    });
  }

  return next({ input, ctx });
});
