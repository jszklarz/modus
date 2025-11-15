import { useUser } from "@clerk/clerk-react";
import { useParams } from "@tanstack/react-router";
import { useSelector } from "@xstate/store/react";
import { useCallback } from "react";
import { inputStore } from "../store/input.store";
import { trpc } from "../../trpc";
import { Message } from "../channel/types";
import { messageStore } from "../store/message.store";

/**
 * Hook responsible for handle the sending of local messages.
 *
 * This handles optimistic updating of messages.
 */
export const useSendMessage = () => {
  const { transcription } = useSelector(inputStore, (state) => state.context);
  const params = useParams({ strict: false }) as { channelId?: string };
  const { user } = useUser();

  const postMessageMutation = trpc.postMessage.useMutation();

  return useCallback(async () => {
    if (transcription.trim() === "") return;

    if (!params.channelId) {
      console.error("No channel selected");
      return;
    }

    if (!user) {
      console.error("No user found");
      return;
    }

    // Create optimistic message with temporary ID
    const tempId = `temp_${Date.now()}_${Math.random()}`;
    const userEmail = user.emailAddresses.find((email) => email.id === user.primaryEmailAddressId);

    const optimisticMessage: Message = {
      id: tempId,
      channelId: params.channelId,
      userId: user.id,
      content: transcription.trim(),
      createdAt: new Date().toISOString(),
      status: "pending",
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
        emailAddress: userEmail?.emailAddress || "",
      },
    };

    console.log("Sending message (optimistic):", transcription);

    // Add optimistic message immediately
    messageStore.send({
      type: "addChannelMessages",
      channelId: params.channelId,
      message: [optimisticMessage],
    });

    // Clear input immediately
    inputStore.send({ type: "setTranscription", transcription: "" });
    inputStore.send({ type: "setInputState", inputState: "microphone" });

    try {
      const result = await postMessageMutation.mutateAsync({
        channelId: params.channelId,
        content: optimisticMessage.content,
      });

      console.log("✅ Message sent successfully");

      // Replace optimistic message with real one from server
      if (result && result.length > 0) {
        messageStore.send({
          type: "replaceOptimisticMessage",
          channelId: params.channelId,
          tempId,
          newMessage: {
            ...result[0],
            status: "sent",
            user: optimisticMessage.user,
          },
        });
      }
    } catch (error) {
      console.error("❌ Failed to send message:", error);

      // Mark message as error
      messageStore.send({
        type: "updateMessageStatus",
        channelId: params.channelId,
        messageId: tempId,
        status: "error",
      });
    }
  }, [transcription, params.channelId, postMessageMutation, user]);
};
