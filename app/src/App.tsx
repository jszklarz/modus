import { ClerkProvider, SignedIn, SignedOut, SignIn, useAuth } from "@clerk/clerk-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { useState } from "react";
import { LayoutContainer } from "./modules/layout/LayoutContainer";
import { ThemeProvider } from "./modules/theme/ThemeProvider";
import { trpc } from "./trpc";
import "./App.css";

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

function AppContent() {
  const { getToken } = useAuth();
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: "http://localhost:3000/trpc",
          headers: async () => {
            const token = await getToken();
            return {
              authorization: token ? `Bearer ${token}` : "",
            };
          },
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <div className="w-full h-full">
          <SignedIn>
            <LayoutContainer />
          </SignedIn>
          <SignedOut>
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
  return (
    <ThemeProvider>
      <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
        <AppContent />
      </ClerkProvider>
    </ThemeProvider>
  );
}

export default App;
