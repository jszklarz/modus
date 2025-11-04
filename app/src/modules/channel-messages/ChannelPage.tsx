import { useSelector } from "@xstate/store/react";
import { channelStore } from "../store/channel.store";
import MessageInput from "./input/MessageInput";

export default function ChannelPage() {
  const { selectedChannel } = useSelector(channelStore, (state) => state.context);

  return (
    <>
      {/* Header */}
      <div className="w-full border-b border-zinc-600 py-1 px-2">${selectedChannel?.name}</div>

      {/* Conversation */}
      <div className="grow py-1 px-2">The conversation is here</div>

      {/* Input */}
      <MessageInput className="h-44 flex justify-center items-center gap-4" />
    </>
  );
}
