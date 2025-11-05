import ChannelHeader from "./header/ChannelHeader";
import MessageInput from "./input/MessageInput";

export default function ChannelPage() {
  return (
    <>
      {/* Header */}
      <ChannelHeader className="w-full border-b border-zinc-600 py-1 px-2 flex items center" />

      {/* Conversation */}
      <div className="grow py-1 px-2">The conversation is here</div>

      {/* Input */}
      <MessageInput className="h-44 flex justify-center items-center gap-4" />
    </>
  );
}
