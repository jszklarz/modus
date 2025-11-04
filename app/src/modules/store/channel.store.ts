import { createStore } from "@xstate/store";
import type { Channel } from "@/types/api";

export const channelStore = createStore({
  context: {
    selectedChannel: null as Channel | null,
  },
  on: {
    setSelectedChannel: (context, event: { channel: Channel | null }) => ({
      ...context,
      selectedChannel: event.channel,
    }),
  },
});
