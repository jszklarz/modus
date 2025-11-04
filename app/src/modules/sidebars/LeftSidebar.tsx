import { Button } from "@/components/ui/button";
import type { Channel } from "@/types/api";
import { DollarSign, Dot, LockIcon, LockOpenIcon, Plus, Unlock, X } from "lucide-react";
import { HTMLAttributes, useCallback, useMemo, useRef, useState } from "react";
import { trpc } from "../../trpc";
import { channelStore } from "../store/channel.store";
import { useSelector } from "@xstate/store/react";
import { cn } from "../../lib/utils";

export function LeftSidebar(props: HTMLAttributes<HTMLDivElement>) {
  const [isCreating, setIsCreating] = useState(false);
  const [channelName, setChannelName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch channels using tRPC
  const { data: channels, isLoading, error } = trpc.getChannels.useQuery();

  // Create channel mutation
  const utils = trpc.useUtils();
  const createChannelMutation = trpc.createChannel.useMutation({
    onSuccess: () => {
      // Invalidate the channels query to refetch the list
      utils.getChannels.invalidate();
      // Reset form
      setChannelName("");
      setIsPrivate(false);
      setIsCreating(false);
    },
  });

  const handleCreateChannel = () => {
    if (channelName.trim()) {
      createChannelMutation.mutate({
        name: channelName.trim(),
        isPrivate,
      });
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setChannelName("");
    setIsPrivate(false);
  };

  return (
    <div {...props}>
      {/* Channel header */}
      <div className="p-2 flex justify-between items-center">
        <span className="text-xs text-muted-foreground">CHANNELS</span>
        <Button
          variant="ghost"
          size="icon-sm"
          className="hover:bg-zinc-900"
          onClick={() => setIsCreating(!isCreating)}
        >
          {isCreating ? <X size={14} /> : <Plus size={14} />}
        </Button>
      </div>

      {/* Channel list */}
      <div className="flex flex-col">
        {/* Create channel form - appears as first item in list */}
        {isCreating && (
          <div className="flex items-center pl-3 pr-1 pb-1 gap-1 hover:bg-accent">
            <Dot className="size-3 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value.toLowerCase().replace(/\s/g, "-"))}
              onKeyDown={(e) => {
                // Manually handle Cmd+A (Mac) and Ctrl+A (Windows/Linux) for select all
                if ((e.metaKey || e.ctrlKey) && e.key === "a") {
                  e.preventDefault();
                  inputRef.current?.select();
                  return;
                }

                if (e.key === "Enter") {
                  handleCreateChannel();
                } else if (e.key === "Escape") {
                  handleCancel();
                }
              }}
              onBlur={() => {
                if (!channelName.trim()) {
                  handleCancel();
                }
              }}
              placeholder="channel-name"
              className="text-sm bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground truncate"
              autoFocus
            />
            <label className="flex items-center gap-1 cursor-pointer">
              <Button
                variant="ghost"
                size="icon-sm"
                onChange={() => setIsPrivate(!isPrivate)}
              >
                {isPrivate ? <LockIcon /> : <LockOpenIcon />}
              </Button>
            </label>
          </div>
        )}

        {isLoading && (
          <div className="px-2 py-1 text-sm text-muted-foreground">Loading channels...</div>
        )}

        {error && <div className="px-2 py-1 text-sm text-destructive">Failed to load channels</div>}

        {channels?.map((channel) => (
          <SidebarChannel channel={channel} />
        ))}

        {channels?.length === 0 && !isLoading && !isCreating && (
          <div className="px-2 py-1 text-sm text-muted-foreground">No channels yet</div>
        )}
      </div>
    </div>
  );
}

export function SidebarChannel({ channel }: { channel: Channel }) {
  const { selectedChannel } = useSelector(channelStore, (state) => state.context);

  const selectChannel = useCallback(() => {
    channelStore.send({ type: "setSelectedChannel", channel });
  }, [channel]);

  const isSelectedChannel = useMemo(
    () => channel.id === selectedChannel?.id,
    [channel.id, selectedChannel]
  );

  return (
    <Button
      key={channel.id}
      variant="ghost"
      size="sm"
      className={cn(
        "w-full justify-start items-center py-0.5 h-7 hover:bg-accent rounded-none",
        isSelectedChannel && "bg-accent"
      )}
      onClick={selectChannel}
    >
      {channel.isPrivate ? <LockIcon className="size-3" /> : <Dot className="size-3" />}
      <span className="truncate">{channel.name}</span>
    </Button>
  );
}
