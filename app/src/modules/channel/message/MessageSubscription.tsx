import { trpc } from "../../../trpc";
import type { Message } from "../types";

interface MessageSubscriptionProps {
  orgId: string;
  onMessageReceived: (message: Message) => void;
}

/**
 * Component that subscribes to real-time messages for an organization
 */
export function MessageSubscription({ orgId, onMessageReceived }: MessageSubscriptionProps) {
  // Subscribe to messages for this org
  trpc.onMessageAdded.useSubscription(
    { orgId },
    {
      onData: (message) => {
        console.log("Real-time message received:", message);
        onMessageReceived(message as Message);
      },
      onError: (error) => {
        console.error("Subscription error:", error);
      },
    }
  );

  // This component doesn't render anything
  return null;
}
