import { useSelector } from "@xstate/store/react";
import { Minus } from "lucide-react";
import { HTMLAttributes } from "react";
import { channelStore } from "../../store/channel.store";

export default function ChannelHeader(props: HTMLAttributes<HTMLDivElement>) {
  const { selectedChannel } = useSelector(channelStore, (state) => state.context);

  if (!selectedChannel) {
    console.log("No channel selected");
    return;
  }

  return (
    <div {...props}>
      <div className="flex items-center">
        <Minus className="size-5 rotate-90" />
        <div className="max-w-52 truncate">
          <span>{selectedChannel?.name}</span>
        </div>
      </div>
      <div className="grow" />
      <div>
        <span>{`<members>`}</span>
      </div>
    </div>
  );
}
