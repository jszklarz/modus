import { ProtectedContext } from '../../trpc';

export const dashboardService = {
  getLatestMentions: async ({ ctx }: { ctx: ProtectedContext }) => {
    throw new Error('Not implemented');
  },
  getLatestActivity: async ({ ctx }: { ctx: ProtectedContext }) => {
    throw new Error('Not implemented');
  },
  getTopChannels: async ({ ctx }: { ctx: ProtectedContext }) => {
    throw new Error('Not implemented');
  },
};
