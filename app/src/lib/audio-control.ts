// Store the active media stream
let activeMediaStream: MediaStream | null = null;
let audioContext: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let animationFrameId: number | null = null;
let mediaRecorder: MediaRecorder | null = null;
let audioChunks: Blob[] = [];
let audioLevelCallback: ((level: number) => void) | null = null;

/**
 * Starts capturing audio from the microphone
 * Returns the audio stream that can be used for recording
 */
export async function startAudioCapture(): Promise<MediaStream | null> {
  try {
    // Check if getUserMedia is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error("getUserMedia is not supported in this environment");
      alert(
        "Microphone access is not supported in this environment. Please use the browser version at localhost:5173"
      );
      return null;
    }

    console.log("Requesting microphone access...");
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    console.log("Microphone access granted!");
    console.log("Stream details:", {
      id: stream.id,
      active: stream.active,
      tracks: stream.getTracks().map((track) => ({
        kind: track.kind,
        label: track.label,
        enabled: track.enabled,
        muted: track.muted,
        readyState: track.readyState,
      })),
    });

    activeMediaStream = stream;

    // Set up audio analysis to monitor levels
    startAudioMonitoring(stream);

    // Set up MediaRecorder for recording
    startRecording(stream);

    return stream;
  } catch (error) {
    console.error("Failed to access microphone:", error);
    alert(`Microphone access failed: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

/**
 * Starts monitoring audio levels and logs them to console
 */
function startAudioMonitoring(stream: MediaStream): void {
  try {
    // Create audio context and analyser
    audioContext = new AudioContext();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;

    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    console.log("Audio monitoring started");

    // Monitor audio levels
    const monitorLevels = () => {
      if (!analyser) return;

      analyser.getByteFrequencyData(dataArray);

      // Calculate average volume (0-255)
      const average = dataArray.reduce((acc, val) => acc + val, 0) / bufferLength;

      // Normalize to 0-1 range
      const normalizedLevel = average / 255;

      // Call the callback if set
      if (audioLevelCallback) {
        audioLevelCallback(normalizedLevel);
      }

      animationFrameId = requestAnimationFrame(monitorLevels);
    };

    monitorLevels();
  } catch (error) {
    console.error("Failed to start audio monitoring:", error);
  }
}

/**
 * Sets a callback to receive audio level updates (0-1 range)
 */
export function setAudioLevelCallback(callback: (level: number) => void): void {
  audioLevelCallback = callback;
}

/**
 * Starts recording audio using MediaRecorder
 */
function startRecording(stream: MediaStream): void {
  try {
    // Clear previous chunks
    audioChunks = [];
    console.log("Initializing MediaRecorder...");

    // Check supported mime types - prefer WAV for Mistral API compatibility
    const mimeTypes = ["audio/wav", "audio/mp4", "audio/webm", ""];

    let selectedMimeType = "";
    for (const mimeType of mimeTypes) {
      if (mimeType === "" || MediaRecorder.isTypeSupported(mimeType)) {
        selectedMimeType = mimeType;
        console.log(`Using mime type: ${mimeType || "default"}`);
        break;
      }
    }

    // Create MediaRecorder with supported format
    const options = selectedMimeType ? { mimeType: selectedMimeType } : {};
    mediaRecorder = new MediaRecorder(stream, options);

    console.log(
      "MediaRecorder created, state:",
      mediaRecorder.state,
      "actualMimeType:",
      mediaRecorder.mimeType
    );

    mediaRecorder.ondataavailable = (event) => {
      console.log(`ondataavailable fired! Data size: ${event.data.size} bytes`);
      if (event.data.size > 0) {
        audioChunks.push(event.data);
        console.log(
          `Audio chunk recorded: ${event.data.size} bytes. Total chunks: ${audioChunks.length}`
        );
      } else {
        console.warn("ondataavailable fired but data size is 0");
      }
    };

    mediaRecorder.onstart = () => {
      console.log("MediaRecorder onstart fired!");
    };

    mediaRecorder.onstop = () => {
      console.log(`Recording stopped. Total chunks: ${audioChunks.length}`);
    };

    mediaRecorder.onerror = (event) => {
      console.error("MediaRecorder error:", event);
    };

    // Start recording - collect data every 100ms
    console.log("Calling mediaRecorder.start(100)...");
    mediaRecorder.start(100);
    console.log("MediaRecorder.start() called. Current state:", mediaRecorder.state);
  } catch (error) {
    console.error("Failed to start recording:", error);
  }
}

/**
 * Gets the recorded audio as a Blob
 */
export function getRecordedAudio(): Blob | null {
  if (audioChunks.length === 0) {
    console.warn("No audio chunks recorded");
    return null;
  }

  const audioBlob = new Blob(audioChunks, { type: "audio/webm;codecs=opus" });
  console.log(`Created audio blob: ${audioBlob.size} bytes`);
  return audioBlob;
}

/**
 * Stops the audio capture and releases the microphone
 */
export function stopAudioCapture(): void {
  console.log("Stopping audio capture...");

  // Stop recording
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
    console.log("MediaRecorder stopped");
  }

  // Stop monitoring
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  // Close audio context
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }

  analyser = null;
  audioLevelCallback = null;

  // Stop all tracks
  if (activeMediaStream) {
    activeMediaStream.getTracks().forEach((track) => {
      console.log(`Stopping track: ${track.label}`);
      track.stop();
    });
    activeMediaStream = null;
  }

  console.log("Audio capture stopped");
}

/**
 * Gets the current active media stream
 */
export function getActiveStream(): MediaStream | null {
  return activeMediaStream;
}
