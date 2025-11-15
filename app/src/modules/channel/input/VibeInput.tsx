import { useSelector } from "@xstate/store/react";
import { Mic, SendHorizonal, Square } from "lucide-react";
import { HTMLAttributes, useCallback, useEffect, useRef, useMemo } from "react";
import {
  getRecordedAudio,
  setAudioLevelCallback,
  setLowAudioCallback,
  startAudioCapture,
  stopAudioCapture,
} from "../../../lib/audio-control";
import { convertWebMToMp3 } from "../../../lib/audio-converter";
import { cn } from "../../../lib/utils";
import { inputStore } from "../../store/input.store";
import TextInput from "./TextInput";
import { useSendMessage } from "../../hooks/useSendMessage";
import { ShakeText } from "../../splash/ShakeText";

const MISTRAL_API_KEY = import.meta.env.VITE_MISTRAL_API_KEY;

const TRANSCRIBING_MESSAGES = [
  "Transcribing",
  "Listening",
  "Processing",
  "Decoding",
  "Analyzing",
  "Interpreting",
  "Parsing",
  "Pondering",
  "Musing",
  "Contemplating",
  "Deliberating",
  "Cogitating",
  "Ruminating",
  "Reflecting",
  "Considering",
  "Examining",
  "Scrutinizing",
  "Investigating",
  "Exploring",
  "Dissecting",
  "Unpacking",
  "Unraveling",
  "Deciphering",
  "Untangling",
  "Extracting",
  "Distilling",
  "Synthesizing",
  "Composing",
  "Formulating",
  "Articulating",
  "Translating",
  "Converting",
  "Transmuting",
  "Transforming",
  "Rendering",
  "Channeling",
  "Capturing",
  "Absorbing",
  "Ingesting",
  "Digesting",
  "Assimilating",
  "Comprehending",
  "Grasping",
  "Perceiving",
  "Discerning",
  "Recognizing",
  "Identifying",
  "Detecting",
  "Sensing",
  "Intuiting",
  "Divining",
  "Conjuring",
  "Manifesting",
  "Materializing",
  "Crystallizing",
  "Coalescing",
  "Condensing",
  "Concentrating",
  "Focusing",
  "Honing",
  "Refining",
  "Polishing",
  "Perfecting",
];

export default function VibeInput(props: HTMLAttributes<HTMLDivElement>) {
  const { isRecording, isTranscribing, inputState, transcription, isAudioTooSoft } = useSelector(
    inputStore,
    (state) => state.context
  );
  const pulseRef = useRef<HTMLDivElement>(null);
  const handleSendMessage = useSendMessage();

  // Pick a random message when transcribing starts (memoized to stay consistent while visible)
  const transcribingMessage = useMemo(
    () => TRANSCRIBING_MESSAGES[Math.floor(Math.random() * TRANSCRIBING_MESSAGES.length)],
    [isTranscribing]
  );

  // Set up audio level callback
  useEffect(() => {
    setAudioLevelCallback((level) => {
      // Directly update DOM for smooth 60fps animation
      if (pulseRef.current) {
        const scale = 1 + level * 1.5; // More sensitive: scales up to 2.5x
        pulseRef.current.style.transform = `scale(${scale})`;
      }
    });
  }, []);

  // Set up low audio detection callback
  useEffect(() => {
    setLowAudioCallback((isTooSoft) => {
      console.log("Low audio callback triggered:", isTooSoft);
      inputStore.send({ type: "setIsAudioTooSoft", isAudioTooSoft: isTooSoft });
    });
  }, []);

  const toggleRecording = useCallback(async () => {
    console.log("Button clicked! isRecording:", isRecording);
    if (!isRecording) {
      // Start recording - capture microphone audio
      console.log("Starting audio capture...");
      const stream = await startAudioCapture();
      if (stream) {
        console.log("Stream acquired, setting isRecording to true");
        inputStore.send({ type: "setIsRecording", isRecording: true });
        console.log("Recording started", stream);
      } else {
        console.error("Failed to start recording - no stream");
      }
      return;
    }

    // Stop recording - release microphone
    console.log("Stopping recording...");
    stopAudioCapture();
    inputStore.send({ type: "setIsRecording", isRecording: false });
    inputStore.send({ type: "setInputState", inputState: "text" });
    console.log("Recording stopped");

    // Get the recorded audio and transcribe it
    const audioBlob = getRecordedAudio();
    if (audioBlob) {
      console.log("Got audio blob, starting transcription...");
      inputStore.send({ type: "setIsTranscribing", isTranscribing: true });

      try {
        // Convert WebM to WAV
        const wavBlob = await convertWebMToMp3(audioBlob);
        console.log("Sending WAV audio to Mistral API...");

        // Get API key from environment or prompt user
        if (!MISTRAL_API_KEY) {
          console.error("No API key provided");
          inputStore.send({ type: "setIsTranscribing", isTranscribing: false });
          return;
        }

        // Call Mistral Transcription API directly
        const formData = new FormData();
        formData.append("file", wavBlob, "audio.wav");
        formData.append("model", "voxtral-mini-latest");

        const response = await fetch("https://api.mistral.ai/v1/audio/transcriptions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${MISTRAL_API_KEY}`,
          },
          body: formData,
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API request failed (${response.status}): ${errorText}`);
        }

        const result = await response.json();
        const transcription = result.text || "";
        console.log("Transcription result:", transcription);
        inputStore.send({ type: "setTranscription", transcription });
        inputStore.send({ type: "setIsTranscribing", isTranscribing: false });
      } catch (error) {
        console.error("Failed to process audio:", error);
        alert(`Transcription failed: ${error}`);
        inputStore.send({ type: "setIsTranscribing", isTranscribing: false });
      }
    } else {
      console.warn("No audio recorded");
    }
  }, [isRecording]);

  return (
    <div className={cn(props.className, "relative w-full")}>
      {/* Warning banner for low audio */}
      {isRecording && isAudioTooSoft && (
        <div className="absolute bottom-full left-0 right-0 mb-1 px-2">
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-md px-3 py-2 text-xs text-amber-200">
            <span className="font-semibold">Audio too soft:</span> Your microphone may be muted or too quiet. Please check your input volume.
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 h-16 p-2 w-full">
        {/* Microphone button on the left */}
        <button
        className={cn(
          "h-full shrink-0 flex justify-center items-center rounded-md transition-all duration-300",
          "shadow-lg hover:scale-105 active:scale-95",
          isRecording
            ? "bg-gradient-to-br from-red-500 via-rose-500 to-pink-500 hover:from-red-400 hover:via-rose-400 hover:to-pink-400"
            : "bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:via-teal-400 hover:to-cyan-400"
        )}
        style={{ aspectRatio: "1" }}
        onClick={(e) => {
          e.stopPropagation();
          toggleRecording();
        }}
      >
        <InputIcon />
      </button>

      {/* Content area */}
      <div
        className={cn(
          "grow h-full relative flex",
          !isTranscribing && !isRecording && "items-center"
        )}
      >
        {isTranscribing || isRecording ? (
          <ShakeText
            text={isTranscribing ? transcribingMessage : "Recording"}
            className="text-zinc-200 text-lg font-semibold"
            strength={10}
            rate={1}
          />
        ) : inputState === "text" ? (
          <div className="w-full h-full rounded-md bg-muted border border-secondary">
            <TextInput onSendMessage={handleSendMessage} />
          </div>
        ) : null}
      </div>

        {/* Send button */}
        <button
          className={cn(
            "h-full shrink-0 flex justify-center items-center rounded-md transition-all duration-300",
            "bg-primary hover:scale-105 active:scale-95",
            transcription.length === 0 && "opacity-50 cursor-not-allowed"
          )}
          style={{ aspectRatio: "1" }}
          onClick={(e) => {
            e.stopPropagation();
            handleSendMessage();
          }}
          disabled={transcription.length === 0}
        >
          <SendHorizonal className="stroke-white" />
        </button>
      </div>
    </div>
  );
}

function InputIcon() {
  const { isRecording } = useSelector(inputStore, (state) => state.context);

  if (!isRecording) return <Mic className="size-6 text-white" />;
  return <Square className="size-5 fill-white" />;
}
