import {
  ClerkProvider,
  OrganizationSwitcher,
  SignedIn,
  SignedOut,
  SignIn,
  useAuth,
  useOrganization,
} from "@clerk/clerk-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { createWSClient, httpBatchLink, splitLink, wsLink } from "@trpc/client";
import { useState, useEffect, useCallback, useRef } from "react";
import { ThemeProvider } from "./modules/theme/ThemeProvider";
import { trpc } from "./trpc";
import "./App.css";
import { metaStore } from "./modules/store/meta.store";
import { SplashScreen } from "./modules/splash/SplashScreen";
import { FullTitleBar } from "./modules/layout/TitleBar";
import { useKeymap } from "./modules/keymap/useKeymap";
import { router } from "./modules/routes/routes";
import { useMic } from "./modules/hooks/useMic";

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

function AppContent() {
  const { getToken } = useAuth();
  const { organization } = useOrganization();

  const [queryClient] = useState(() => new QueryClient());
  const [splashComplete, setSplashComplete] = useState(false);

  const handleSplashComplete = useCallback(() => {
    setSplashComplete(true);
  }, []);

  // Register global keyboard shortcuts
  useKeymap();

  const [trpcClient] = useState(() => {
    // Create WebSocket client for subscriptions
    const wsClient = createWSClient({
      url: "ws://localhost:3000",
    });

    return trpc.createClient({
      links: [
        splitLink({
          condition: (op) => op.type === "subscription",
          true: wsLink({ client: wsClient }),
          false: httpBatchLink({
            url: "http://localhost:3000/trpc",
            headers: async () => {
              const token = await getToken();
              return {
                authorization: token ? `Bearer ${token}` : "",
              };
            },
          }),
        }),
      ],
    });
  });

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <div className="w-full h-full">
          <SignedIn>
            {!organization ? (
              <>
                <FullTitleBar />
                <div className="flex flex-col items-center justify-center w-full h-full gap-4">
                  <div className="text-zinc-400 text-lg mb-4">
                    Please select an organization to continue
                  </div>
                  <OrganizationSwitcher
                    hidePersonal
                    afterCreateOrganizationUrl="/"
                    afterSelectOrganizationUrl="/"
                  />
                </div>
              </>
            ) : !splashComplete ? (
              <>
                <FullTitleBar />
                <SplashScreen onReady={handleSplashComplete} />
              </>
            ) : (
              <div style={{ perspective: "1000px", width: "100%", height: "100%" }}>
                <RouterProvider router={router} />
              </div>
            )}
          </SignedIn>
          <SignedOut>
            <FullTitleBar />
            <div className="flex justify-center items-center w-full h-full">
              <SignIn routing="hash" />
            </div>
          </SignedOut>
        </div>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

function App() {
  // Microphone management hook - stream persists once initialized
  const { initializeMic, releaseMic } = useMic();
  const hasRequestedMic = useRef(false);

  // Initialize microphone on app startup
  useEffect(() => {
    if (hasRequestedMic.current) {
      console.log("Microphone access already requested, skipping...");
      return;
    }

    hasRequestedMic.current = true;

    const initMic = async () => {
      try {
        // Initialize mic - stream stays open (no stop/start churn)
        await initializeMic();
        metaStore.send({ type: "setMicAccess", granted: true });
      } catch (error) {
        console.error("Failed to get microphone access:", error);
        metaStore.send({
          type: "setMicAccessError",
          message: error instanceof Error ? error.message : "Unknown error",
          error: error instanceof Error ? error : new Error(String(error)),
        });
      }
    };

    initMic();

    // Cleanup only on app-level unmount (window close)
    return () => {
      console.log("App unmounting, releasing microphone...");
      releaseMic();
    };
  }, [initializeMic, releaseMic]);

  return (
    <ThemeProvider>
      <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
        <AppContent />
      </ClerkProvider>
    </ThemeProvider>
  );
}

export default App;
