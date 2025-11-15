import { useOrganization, useUser } from "@clerk/clerk-react";
import { useParams } from "@tanstack/react-router";
import { useSelector } from "@xstate/store/react";
import { useCallback, useEffect, useState } from "react";
import { cn } from "../../lib/utils";
import { trpc } from "../../trpc";
import { messageStore } from "../store/message.store";
import VibeInput from "./input/VibeInput";
import { MessageRow } from "./message/MessageRow";
import { MessageSubscription } from "./message/MessageSubscription";
import type { Message } from "./types";

export default function ChannelPage() {
  const { organization } = useOrganization();
  const { user } = useUser();
  const { channelId } = useParams({ from: "/channel/$channelId" });
  const { channelMessages } = useSelector(messageStore, (state) => state.context);
  const [showScroll, setShowScroll] = useState(false);

  // Get messages for the currently selected channel
  const messages = channelId ? channelMessages[channelId] || [] : [];
  const hasMessagesForChannel = messages.length > 0;

  // Fetch recent messages when a channel is selected and has no messages loaded
  const { data: fetchedMessages } = trpc.getMessages.useQuery(
    {
      channelId: channelId || "",
      limit: 20,
    },
    {
      enabled: !!channelId && !hasMessagesForChannel,
    }
  );

  // Load fetched messages into the store
  useEffect(() => {
    if (fetchedMessages && channelId) {
      // Reverse the messages to be in ascending order (oldest first)
      // so that flex-col-reverse displays newest at bottom
      messageStore.send({
        type: "setChannelMessages",
        channelId: channelId,
        messages: [...fetchedMessages].reverse(),
      });
    }
  }, [fetchedMessages, channelId]);

  const handleMessageReceived = useCallback(
    (message: Message) => {
      console.log("📨 Real-time message received:", message);

      // Only add messages from other users
      // Our own messages are already added optimistically and replaced with server response
      // See: TextInput#useSendMessage
      if (user && message.userId === user.id) {
        console.log("⏭️  Skipping own message (already handled optimistically)");
        return;
      }

      messageStore.send({
        type: "addChannelMessages",
        channelId: message.channelId,
        message: [{ ...message, status: "sent" }], // Real-time messages are already sent
      });
    },
    [user]
  );

  // At this point, organization must exist because App.tsx checks for it
  if (!organization) return null;

  return (
    <>
      {/* Subscribe to real-time messages for this organization */}
      <MessageSubscription orgId={organization.id} onMessageReceived={handleMessageReceived} />

      {/* Conversation */}
      <div
        className={cn(
          "grow py-1 flex flex-col-reverse",
          showScroll ? "overflow-y-auto" : "overflow-hidden"
        )}
        onMouseEnter={() => setShowScroll(true)}
        onMouseLeave={() => setShowScroll(false)}
      >
        {messages.length === 0 ? (
          <div className="px-4 text-zinc-600 italic">No messages yet.</div>
        ) : (
          <div className="space-y-2 flex flex-col">
            {messages.map((msg) => (
              <MessageRow key={msg.id} message={msg} />
            ))}
          </div>
        )}
      </div>

      <div className="h-6" />

      <div className="m-4 bg-muted flex rounded-md">
        <VibeInput />
      </div>
    </>
  );
}
