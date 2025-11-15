import { createStore } from "@xstate/store";
import type { CmdType, CmdKey, CmdAction } from "../cmd/cmd";

export const cmdStore = createStore({
  context: {
    isOpen: false,
    search: "",
    focusedIndex: 0,
    cmdContext: "global" as CmdType,
    selectedCmd: null as { key: CmdKey; action: CmdAction } | null,
  },
  on: {
    open: (context, event: { cmdContext?: CmdType }) => ({
      ...context,
      isOpen: true,
      search: "",
      focusedIndex: 0,
      selectedCmd: null,
      cmdContext: event.cmdContext ?? context.cmdContext,
    }),
    close: (context) => ({
      ...context,
      isOpen: false,
      search: "",
      focusedIndex: 0,
      selectedCmd: null,
    }),
    toggleOpen: (context) => ({
      ...context,
      isOpen: !context.isOpen,
      search: context.isOpen ? "" : context.search, // Clear search when closing
      focusedIndex: 0,
    }),
    setSearch: (context, event: { search: string }) => ({
      ...context,
      search: event.search,
      focusedIndex: 0, // Reset focus when search changes
    }),
    navigate: (context, event: { direction: "up" | "down"; resultsCount: number }) => {
      const { direction, resultsCount } = event;
      if (resultsCount === 0) return context;

      let newIndex = context.focusedIndex;
      if (direction === "down") {
        newIndex = context.focusedIndex >= resultsCount - 1 ? 0 : context.focusedIndex + 1;
      } else {
        newIndex = context.focusedIndex <= 0 ? resultsCount - 1 : context.focusedIndex - 1;
      }

      return {
        ...context,
        focusedIndex: newIndex,
      };
    },
    setCmdContext: (context, event: { cmdContext: CmdType }) => ({
      ...context,
      cmdContext: event.cmdContext,
    }),
    selectCmd: (context, event: { cmd: { key: CmdKey; action: CmdAction } | null }) => ({
      ...context,
      selectedCmd: event.cmd,
    }),
  },
});
