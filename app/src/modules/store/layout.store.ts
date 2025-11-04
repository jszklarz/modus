import { createStore } from "@xstate/store";

export const LEFT_SIDEBAR_MIN_WIDTH = 140;
export const LEFT_SIDEBAR_DEFAULT_WIDTH = 200;
export const LEFT_SIDEBAR_MAX_WIDTH = 420;

export const RIGHT_SIDEBAR_MIN_WIDTH = 240;
export const RIGHT_SIDEBAR_DEFAULT_WIDTH = 280;
export const RIGHT_SIDEBAR_MAX_WIDTH = 420;

export const layoutStore = createStore({
  context: {
    leftSidebarWidth: LEFT_SIDEBAR_DEFAULT_WIDTH,
    rightSidebarWidth: RIGHT_SIDEBAR_DEFAULT_WIDTH,
    isLeftOpen: true,
    isRightOpen: false,
    isResizingLeft: false,
    isResizingRight: false,
  },
  on: {
    setLeftSidebarWidth: (context, event: { width: number }) => {
      const width = Math.max(LEFT_SIDEBAR_MIN_WIDTH, Math.min(LEFT_SIDEBAR_MAX_WIDTH, event.width));
      return {
        ...context,
        leftSidebarWidth: width,
      };
    },
    setRightSidebarWidth: (context, event: { width: number }) => {
      const width = Math.max(
        RIGHT_SIDEBAR_MIN_WIDTH,
        Math.min(RIGHT_SIDEBAR_MAX_WIDTH, event.width)
      );
      return {
        ...context,
        rightSidebarWidth: width,
      };
    },
    toggleLeftSidebar: (context) => ({
      ...context,
      isLeftOpen: !context.isLeftOpen,
    }),
    toggleRightSidebar: (context) => ({
      ...context,
      isRightOpen: !context.isRightOpen,
    }),
    startResizingLeft: (context) => ({
      ...context,
      isResizingLeft: true,
    }),
    stopResizingLeft: (context) => ({
      ...context,
      isResizingLeft: false,
    }),
    startResizingRight: (context) => ({
      ...context,
      isResizingRight: true,
    }),
    stopResizingRight: (context) => ({
      ...context,
      isResizingRight: false,
    }),
    stopResizing: (context) => ({
      ...context,
      isResizingLeft: false,
      isResizingRight: false,
    }),
  },
});
