import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "../../api/src/router";

/**
 * Create a tRPC React client with full type safety
 * This links to the API router types for end-to-end type safety
 */
export const trpc = createTRPCReact<AppRouter>();
