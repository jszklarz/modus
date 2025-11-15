import { createStore } from "@xstate/store";

type MetaStoreContext = {
  micAccess: {
    granted: boolean;
    error?: {
      message: string;
      error: Error;
    };
  };
};

type MetaStoreEvents = {
  setMicAccess: { granted: boolean };
  setMicAccessError: { message: string; error: Error };
};

export const metaStore = createStore({
  context: {
    micAccess: {
      granted: false,
      error: undefined,
    },
  } as MetaStoreContext,
  on: {
    setMicAccess: (context, event: MetaStoreEvents["setMicAccess"]) => {
      return {
        ...context,
        micAccess: {
          granted: event.granted,
          error: undefined,
        },
      };
    },
    setMicAccessError: (context, event: MetaStoreEvents["setMicAccessError"]) => {
      return {
        ...context,
        micAccess: {
          granted: false,
          error: {
            message: event.message,
            error: event.error,
          },
        },
      };
    },
  },
});
