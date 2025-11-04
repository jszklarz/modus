import type { AppRouter } from "../../../api/src/router";
import type { inferRouterOutputs } from "@trpc/server";

type RouterOutput = inferRouterOutputs<AppRouter>;

export type Channel = RouterOutput["getChannels"][number];
