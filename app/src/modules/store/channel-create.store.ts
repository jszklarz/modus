import { createStore } from "@xstate/store";

export const channelCreateStore = createStore({
  context: {
    channelName: "",
    isCreating: false,
    isPrivate: false,
  },
  on: {
    setIsCreating: (context, event: { value: boolean }) => ({
      ...context,
      isCreating: event.value,
    }),
    setChannelName: (context, event: { value: string }) => ({
      ...context,
      channelName: event.value,
    }),
    setIsPrivate: (context, event: { value: boolean }) => ({
      ...context,
      isPrivate: event.value,
    }),
  },
});
