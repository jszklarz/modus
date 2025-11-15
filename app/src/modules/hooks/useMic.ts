import { useCallback, useEffect, useRef } from "react";

/**
 * Global mic stream - persists across component lifecycles
 * This is intentionally module-scoped, not component state
 */
let globalMicStream: MediaStream | null = null;

/**
 * Hook for managing persistent microphone access
 *
 * Key design: The mic stream stays open once initialized (like Zoom/Meet)
 * This prevents audio system churn from constantly opening/closing the stream
 */
export function useMic() {
  const streamRef = useRef<MediaStream | null>(null);

  /**
   * Initialize microphone access
   * Safe to call multiple times - returns existing stream if already initialized
   */
  const initializeMic = useCallback(async () => {
    // Already have a stream
    if (globalMicStream) {
      console.log("✅ Mic already initialized, reusing stream");
      streamRef.current = globalMicStream;
      return globalMicStream;
    }

    try {
      console.log("🎤 Initializing microphone access...");

      // Start with basic audio: true to avoid system-level audio issues
      // Add constraints later only if your pipeline specifically needs them
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      console.log("✅ Microphone access granted");

      // Store globally and in ref
      globalMicStream = stream;
      streamRef.current = stream;

      return stream;
    } catch (error) {
      console.error("❌ Failed to get microphone access:", error);
      throw error;
    }
  }, []);

  /**
   * Get the current mic stream without re-initializing
   */
  const getMicStream = useCallback(() => {
    return globalMicStream;
  }, []);

  /**
   * Check if mic is currently active
   */
  const isMicActive = useCallback(() => {
    return globalMicStream !== null &&
           globalMicStream.getAudioTracks().some(track => track.readyState === "live");
  }, []);

  /**
   * Release microphone access
   * Only call this when user explicitly disables voice features or app is closing
   * NOT on component unmount!
   */
  const releaseMic = useCallback(() => {
    if (!globalMicStream) {
      console.log("ℹ️ No mic stream to release");
      return;
    }

    console.log("🛑 Releasing microphone...");

    globalMicStream.getAudioTracks().forEach((track) => {
      console.log(`  Stopping track: ${track.kind} (${track.readyState})`);
      track.stop();
      console.log(`  Track stopped: ${track.readyState}`);
    });

    globalMicStream = null;
    streamRef.current = null;

    console.log("✅ Microphone released");
  }, []);

  // Cleanup only on app-level unmount (not component unmount)
  // This effect is more of a safety net than the primary cleanup mechanism
  useEffect(() => {
    return () => {
      // Only cleanup if this is truly the last instance
      // (in practice, with persistent stream, this rarely triggers)
      if (streamRef.current && streamRef.current === globalMicStream) {
        console.log("⚠️ Component unmounting, but keeping mic stream alive");
      }
    };
  }, []);

  return {
    initializeMic,
    getMicStream,
    isMicActive,
    releaseMic,
  };
}

/**
 * Utility to check mic permission state without opening the stream
 */
export async function getMicPermissionState(): Promise<PermissionState | null> {
  if (!("permissions" in navigator)) {
    console.warn("Permissions API not available");
    return null;
  }

  try {
    const status = await navigator.permissions.query({
      name: "microphone" as PermissionName
    });
    return status.state;
  } catch (error) {
    console.error("Failed to query mic permission:", error);
    return null;
  }
}
