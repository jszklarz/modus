import { channelRouter } from './modules/channel/channel.router';
import { dashboardRouter } from './modules/dashboard/dashboard.router';
import { memberRouter } from './modules/members/member.router';
import { messageRouter } from './modules/message/message.router';
import { router } from './trpc';

/**
 * App Router - Define your API endpoints here
 */
export const appRouter = router({
  ...channelRouter,
  ...memberRouter,
  ...messageRouter,
  ...dashboardRouter,
});

// Export type router type signature for the client
export type AppRouter = typeof appRouter;
