import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from './router';

/**
 * Create a tRPC client for use in the Neutralino app
 *
 * Usage example:
 *
 * import { trpc } from './path/to/client';
 *
 * // Query
 * const result = await trpc.greeting.query({ name: 'World' });
 *
 * // Mutation
 * const post = await trpc.createPost.mutate({
 *   title: 'Hello',
 *   content: 'World'
 * });
 */
export const createClient = (apiUrl: string = 'http://localhost:3000/trpc') => {
  return createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: apiUrl,
      }),
    ],
  });
};

// Default client instance
export const trpc = createClient();
