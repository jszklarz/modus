import { useOrganization, useUser } from "@clerk/clerk-react";
import { useSelector } from "@xstate/store/react";
import { useEffect, useRef } from "react";
import { metaStore } from "../store/meta.store";
import { AnimatedBars } from "./AnimatedBars";
import { ShakeText } from "./ShakeText";

const MIN_SPLASH_SCREEN_WAIT_MS = 1000;

interface SplashScreenProps {
  onReady: () => void;
}

export function SplashScreen({ onReady }: SplashScreenProps) {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { organization, isLoaded: isOrgLoaded } = useOrganization();

  // Use useSelector to get the primitive boolean value directly
  const micReady = useSelector(metaStore, (state) => state.context.micAccess.granted);

  const userReady = isUserLoaded && !!user;
  const orgReady = isOrgLoaded && !!organization;

  const allChecksComplete = userReady && orgReady && micReady;

  // Use a ref to track if we've already triggered the ready callback
  const hasCalledReady = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Checks conditions, then proceeds
  useEffect(() => {
    console.log("🎯 SplashScreen effect:", { allChecksComplete, hasCalledReady: hasCalledReady.current, hasTimer: !!timerRef.current });

    if (allChecksComplete && !hasCalledReady.current && !timerRef.current) {
      console.log("✅ All checks complete, setting timer...");

      timerRef.current = setTimeout(() => {
        console.log("⏰ Timer fired, calling onReady");
        hasCalledReady.current = true;
        timerRef.current = null;
        onReady();
      }, MIN_SPLASH_SCREEN_WAIT_MS);
    }

    return () => {
      if (timerRef.current) {
        console.log("🧹 Cleanup: clearing timer");
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allChecksComplete]);

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-full gap-6 overflow-hidden bg-muted">
      <div className="relative z-10 flex flex-col items-center gap-6">
        <ShakeText
          text="Calibrating"
          className="text-zinc-200 text-2xl font-semibold mb-4"
          strength={10}
          rate={1}
        />

        {!allChecksComplete ? (
          <div className="flex flex-col items-center gap-3 min-w-[300px]">
            <CheckItem
              label="Requesting microphone access"
              isComplete={micReady}
              isActive={!allChecksComplete}
            />
          </div>
        ) : (
          <div className="text-emerald-500 text-sm mt-4">All set! Starting...</div>
        )}
      </div>

      <AnimatedBars />
    </div>
  );
}

interface CheckItemProps {
  label: string;
  isComplete: boolean;
  isActive: boolean;
}

function CheckItem({ label, isComplete, isActive }: CheckItemProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-5 h-5 flex items-center justify-center">
        {isComplete ? (
          <svg
            className="w-5 h-5 text-emerald-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : isActive ? (
          <div className="w-4 h-4 border-2 border-zinc-400 border-t-zinc-200 rounded-full animate-spin" />
        ) : (
          <div className="w-4 h-4 border-2 border-zinc-700 rounded-full" />
        )}
      </div>
      <span
        className={`text-sm ${
          isComplete ? "text-emerald-500" : isActive ? "text-zinc-200" : "text-zinc-600"
        }`}
      >
        {label}
      </span>
    </div>
  );
}
