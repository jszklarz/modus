import { channelRouter } from './modules/channel/channel.router';
import { messageRouter } from './modules/message/messag.router';
import { router } from './trpc';

/**
 * App Router - Define your API endpoints here
 */
export const appRouter = router({
  ...channelRouter,
  ...messageRouter,
});

// Export type router type signature for the client
export type AppRouter = typeof appRouter;
