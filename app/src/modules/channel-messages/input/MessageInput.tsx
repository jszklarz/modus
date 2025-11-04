import { Mic, Square } from "lucide-react";
import { HTMLAttributes, useCallback, useState, useEffect, useRef } from "react";
import { cn } from "../../../lib/utils";
import { startAudioCapture, stopAudioCapture, getRecordedAudio, setAudioLevelCallback } from "../../../lib/audio-control";
import { convertWebMToMp3 } from "../../../lib/audio-converter";
import { useSelector } from "@xstate/store/react";
import { inputStore } from "../../store/input.store";

const MISTRAL_API_KEY = import.meta.env.VITE_MISTRAL_API_KEY;

export default function MessageInput(props: HTMLAttributes<HTMLDivElement>) {
  const {isRecording, transcription, isTranscribing, inputState} = useSelector(inputStore, state => state.context);

  const pulseRef = useRef<HTMLDivElement>(null);

  // Set up audio level callback
  useEffect(() => {
    setAudioLevelCallback((level) => {
      // Directly update DOM for smooth 60fps animation
      if (pulseRef.current) {
        const scale = 1 + level * 1.5; // More sensitive: scales up to 2.5x
        pulseRef.current.style.transform = `scale(${scale})`;
      } else {
        console.log("pulseRef.current is null, level:", level);
      }
    });
  }, []);

  const handleSendMessage = useCallback(() => {
    if (transcription.trim() === "") return;

    console.log("Sending message:", transcription);
    // TODO: Actually send the message to the backend

    // Clear and reset to microphone state
    inputStore.send({type: "setTranscription", transcription: ""});
    inputStore.send({type: "setInputState", inputState: "microphone"});
  }, [transcription]);

  const toggleRecording = useCallback(async () => {
    console.log("Button clicked! isRecording:", isRecording);
    if (!isRecording) {
      // Start recording - capture microphone audio
      console.log("Starting audio capture...");
      const stream = await startAudioCapture();
      if (stream) {
        console.log("Stream acquired, setting isRecording to true");
        inputStore.send({type: "setIsRecording", isRecording: true})
        console.log("Recording started", stream);
      } else {
        console.error("Failed to start recording - no stream");
      }
      return;
    }

    // Stop recording - release microphone
    console.log("Stopping recording...");
    stopAudioCapture();
    inputStore.send({type: "setIsRecording", isRecording: false})
    inputStore.send({type: "setInputState", inputState: "text"})
    console.log("Recording stopped");

    // Get the recorded audio and transcribe it
    const audioBlob = getRecordedAudio();
    if (audioBlob) {
      console.log("Got audio blob, starting transcription...");
      inputStore.send({type: "setIsTranscribing", isTranscribing: true})

      try {
        // Convert WebM to WAV
        const wavBlob = await convertWebMToMp3(audioBlob);
        console.log("Sending WAV audio to Mistral API...");

        // Get API key from environment or prompt user
        if (!MISTRAL_API_KEY) {
          console.error("No API key provided");
          inputStore.send({type: "setIsTranscribing", isTranscribing: false})
          return;
        }

        // Call Mistral Transcription API directly
        const formData = new FormData();
        formData.append('file', wavBlob, 'audio.wav');
        formData.append('model', 'voxtral-mini-latest');

        const response = await fetch('https://api.mistral.ai/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${MISTRAL_API_KEY}`,
          },
          body: formData
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API request failed (${response.status}): ${errorText}`);
        }

        const result = await response.json();
        const transcription = result.text || "";
        console.log("Transcription result:", transcription);
        inputStore.send({type: "setTranscription", transcription})
        inputStore.send({type: "setIsTranscribing", isTranscribing: false})
      } catch (error) {
        console.error("Failed to process audio:", error);
        alert(`Transcription failed: ${error}`);
        inputStore.send({type: "setIsTranscribing", isTranscribing: false})
      }
    } else {
      console.warn("No audio recorded");
    }
  }, [isRecording]);

  return (
    <div {...props}>
      {/* Dictation typing section */}
      <div className="relative w-5/6 max-w-[800px] h-full py-8">
        <div
          className={cn("h-full rounded-md p-4", inputState === "text" && "bg-neutral-900 border border-zinc-700")}
          onClick={() => {
            // Switch to text state when clicking on the input area in microphone mode
            if (inputState === "microphone" && !isRecording) {
              inputStore.send({type: "setInputState", inputState: "text"})
            }
          }}
        >
          {/* Microphone button - centered on input box, shown in microphone state */}
          {inputState === "microphone" && (
            <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
              <div className="relative w-18 h-18 flex justify-center items-center pointer-events-auto">
                {/* Animated pulse rings */}
                {!isRecording && (
                  <>
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 opacity-20 animate-ping-slow" />
                  </>
                )}

                {/* Audio-reactive pulsing circle when recording */}
                {isRecording && (
                  <div
                    ref={pulseRef}
                    className="absolute rounded-full bg-gradient-to-r from-red-500 to-rose-500 opacity-30"
                    style={{
                      width: '64px',
                      height: '64px',
                      left: '50%',
                      top: '50%',
                      marginLeft: '-32px',
                      marginTop: '-32px',
                    }}
                  />
                )}


                {/* Mic button with animated gradient */}
                <button
                  className={cn(
                    "relative w-14 h-14 flex justify-center items-center rounded-full z-10 transition-all duration-300",
                    "shadow-lg hover:scale-105 active:scale-95",
                    isRecording
                      ? "bg-gradient-to-br from-red-500 via-rose-500 to-pink-500 hover:from-red-400 hover:via-rose-400 hover:to-pink-400"
                      : "bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:via-teal-400 hover:to-cyan-400"
                  )}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering parent's onClick
                    toggleRecording();
                  }}
                >
                  {isRecording ? <Square className="size-5 fill-white" /> : <Mic className="size-6 text-white" />}
                </button>
              </div>
            </div>
          )}

          {isTranscribing ? (
            <div className="text-zinc-400 italic">Transcribing audio...</div>
          ) : inputState === "text" ? (
            <>
              <textarea
                className="w-full h-full bg-transparent text-white outline-none resize-none text-xs"
                value={transcription}
                onChange={(e) => inputStore.send({type: "setTranscription", transcription: e.target.value})}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                  // Shift+Enter allows new line (default textarea behavior)
                }}
                placeholder="Type a message or use the microphone..."
                autoFocus
              />

              {/* Action buttons in bottom right */}
              <div className="absolute bottom-9 right-1 pointer-events-auto flex gap-1">
                <button
                  onClick={() => {
                    inputStore.send({type: "setTranscription", transcription: ""});
                    inputStore.send({type: "setInputState", inputState: "microphone"})
                  }}
                  className="px-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 text-xs rounded-sm border border-zinc-700 transition-colors"
                >
                  Reset
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={transcription.trim() === ""}
                  className="px-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 text-white disabled:text-zinc-600 text-xs rounded-sm border border-emerald-700 disabled:border-zinc-700 transition-colors"
                >
                  Send
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
