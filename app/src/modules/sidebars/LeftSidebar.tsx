import { Button } from "@/components/ui/button";
import type { Channel } from "@/types/api";
import { useSelector } from "@xstate/store/react";
import { LockIcon, LockOpenIcon, Minus, Moon, Plus, Sun, X } from "lucide-react";
import { HTMLAttributes, useCallback, useMemo, useRef } from "react";
import { cn } from "../../lib/utils";
import { trpc } from "../../trpc";
import { channelCreateStore } from "../store/channel-create.store";
import { channelStore } from "../store/channel.store";
import { TitleBarLeft } from "../layout/TitleBar";
import { themeStore } from "../store/theme.store";
import { useClerk } from "@clerk/clerk-react";

type SortedChannels = {
  public: Channel[];
  private: Channel[];
};

export function LeftSidebar(props: HTMLAttributes<HTMLDivElement>) {
  const { isCreating, isPrivate, channelName } = useSelector(
    channelCreateStore,
    (state) => state.context
  );
  const { theme } = useSelector(themeStore, (state) => state.context);
  const { user } = useClerk();

  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch channels using tRPC
  const { data: channels, isLoading, error } = trpc.getChannels.useQuery();

  const sortedChannels: SortedChannels = useMemo(() => {
    const result: SortedChannels = { public: [], private: [] };

    if (!channels) {
      return result;
    }

    for (const channel of channels) {
      if (channel.isPrivate) {
        result.private.push(channel);
      } else {
        result.public.push(channel);
      }
    }

    result.private.sort((a, b) => a.name.localeCompare(b.name));
    result.public.sort((a, b) => a.name.localeCompare(b.name));

    return result;
  }, [channels]);

  const reset = useCallback(() => {
    channelCreateStore.send({ type: "setIsCreating", value: false });
    channelCreateStore.send({ type: "setIsPrivate", value: false });
    channelCreateStore.send({ type: "setChannelName", value: "" });
  }, []);

  // Create channel mutation
  const utils = trpc.useUtils();
  const createChannelMutation = trpc.createChannel.useMutation({
    onSuccess: () => {
      // Invalidate the channels query to refetch the list
      utils.getChannels.invalidate();
      // Reset form
      reset();
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

  return (
    <div {...props} className={cn("flex flex-col h-full", props.className)}>
      {/* Custom Window titlebar section */}
      <TitleBarLeft />

      {/* Channel header */}
      <div className="p-2 flex justify-between items-center">
        <span className="text-xs text-muted-foreground">CHANNELS</span>
        <Button
          variant="ghost"
          size="icon-sm"
          className="hover:bg-zinc-900"
          onClick={() => channelCreateStore.send({ type: "setIsCreating", value: !isCreating })}
        >
          {isCreating ? <X size={14} /> : <Plus size={14} />}
        </Button>
      </div>

      {/* Channel list */}
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* Create channel form - appears as first item in list */}
        {isCreating && (
          <div className="flex items-center pl-2 pr-1 py-1 gap-1 hover:bg-accent">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => channelCreateStore.send({ type: "setIsPrivate", value: !isPrivate })}
            >
              {isPrivate ? (
                <LockIcon className="size-3 shrink-0" />
              ) : (
                <Minus className="size-5 rotate-90 shrink-0" />
              )}
            </Button>

            <input
              ref={inputRef}
              type="text"
              value={channelName}
              onChange={(e) =>
                channelCreateStore.send({
                  type: "setChannelName",
                  value: e.target.value.toLowerCase().replace(/\s/g, "-"),
                })
              }
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
                  reset();
                }
              }}
              onBlur={() => {
                // if (!channelName.trim()) {
                //   reset();
                // }
              }}
              placeholder="channel-name"
              className="text-sm bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground truncate -mb-1"
              autoFocus
            />
          </div>
        )}

        {isLoading && (
          <div className="px-2 py-1 text-sm text-muted-foreground">Loading channels...</div>
        )}

        {error && <div className="px-2 py-1 text-sm text-destructive">Failed to load channels</div>}

        {/* Public channels */}
        <span className="pl-3 text-xs text-muted-foreground">PUBLIC</span>
        {sortedChannels.public.map((channel) => (
          <SidebarChannel key={channel.id} channel={channel} />
        ))}

        {/* Separator */}
        <div className="h-5" />

        {/* Private channels */}
        <span className="pl-3 text-xs text-muted-foreground">PRIVATE</span>
        {sortedChannels.private.map((channel) => (
          <SidebarChannel key={channel.id} channel={channel} />
        ))}

        {channels?.length === 0 && !isLoading && !isCreating && (
          <div className="px-2 py-1 text-sm text-muted-foreground">No channels yet</div>
        )}
      </div>

      {/* Footer - pinned to bottom */}
      <div className="flex items-center justify-between p-2 mt-auto">
        <img className="rounded-md size-5" src={user?.imageUrl} />
        <button onClick={() => themeStore.send({ type: "toggleTheme" })}>
          {theme === "dark" ? <Moon className="size-4" /> : <Sun className="size-4" />}
        </button>
      </div>
    </div>
  );
}

export function SidebarChannel({
  channel,
  ...props
}: { channel: Channel } & HTMLAttributes<HTMLButtonElement>) {
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
      {...props}
      variant="ghost"
      size="sm"
      className={cn(
        "w-full justify-start items-center py-0.5 h-6 hover:bg-accent rounded-none",
        isSelectedChannel && "bg-accent"
      )}
      onClick={selectChannel}
    >
      {channel.isPrivate ? (
        <LockIcon className="size-3" />
      ) : (
        <Minus className="-ml-1 size-5 rotate-90" />
      )}
      <span className="truncate">{channel.name}</span>
    </Button>
  );
}
