import { createStore } from "@xstate/store";
import { ReactNode } from "react";

export const titleBarStore = createStore({
  context: {
    isHovered: false,
    sidebarActions: null as ReactNode | null,
  },
  on: {
    setHovered: (context, event: { isHovered: boolean }) => ({
      ...context,
      isHovered: event.isHovered,
    }),
  },
});
