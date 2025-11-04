import { createStore } from "@xstate/store";

export const inputStore = createStore({
  context: {
    isRecording: false,
    transcription: "",
    isTranscribing: false,
    inputState: "microphone" as "text" | "microphone",
  },
  on: {
    setIsRecording: (context, event: { isRecording: boolean }) => ({
      ...context,
      isRecording: event.isRecording,
    }),
    setTranscription: (context, event: { transcription: string }) => ({
      ...context,
      transcription: event.transcription,
    }),
    setIsTranscribing: (context, event: { isTranscribing: boolean }) => ({
      ...context,
      isTranscribing: event.isTranscribing,
    }),
    setInputState: (context, event: { inputState: "text" | "microphone" }) => ({
      ...context,
      inputState: event.inputState,
    }),
  },
});
