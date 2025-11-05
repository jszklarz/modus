import { protectedProcedure } from '../../trpc';
import { dashboardService } from './dashboard.service';

export const dashboardRouter = {
  latestMentions: protectedProcedure.query(dashboardService.getLatestMentions),
  latestActivity: protectedProcedure.query(dashboardService.getLatestActivity),
  topChannels: protectedProcedure.query(dashboardService.getTopChannels),
};
