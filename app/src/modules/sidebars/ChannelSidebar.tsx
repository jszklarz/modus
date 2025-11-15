import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { Channel } from "@/types/api";
import { useClerk } from "@clerk/clerk-react";
import { useParams } from "@tanstack/react-router";
import { useSelector } from "@xstate/store/react";
import { LockIcon, Minus, Moon, Plus, Sun, X } from "lucide-react";
import { HTMLAttributes, useCallback, useMemo, useRef, useState } from "react";
import { cn } from "../../lib/utils";
import { trpc } from "../../trpc";
import { useNavigation } from "../hooks/useNavigation";
import { channelCreateStore } from "../store/channel-create.store";
import { themeStore } from "../store/theme.store";

type SortedChannels = {
  public: Channel[];
  private: Channel[];
};

export function ChannelSidebar(props: HTMLAttributes<HTMLDivElement>) {
  const { isCreating, isPrivate, channelName } = useSelector(
    channelCreateStore,
    (state) => state.context
  );
  const { theme } = useSelector(themeStore, (state) => state.context);
  const { user } = useClerk();
  const { goToPreferences } = useNavigation();

  const [popoverOpen, setPopoverOpen] = useState(false);
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
      {/* Channel header */}
      <div className="p-2 flex justify-between items-center">
        <span className="text-xs text-muted-foreground">CHANNELS</span>
        {isCreating ? (
          <Button
            variant="ghost"
            size="icon-sm"
            className="hover:bg-zinc-900"
            onClick={() => channelCreateStore.send({ type: "setIsCreating", value: false })}
          >
            <X size={14} />
          </Button>
        ) : (
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="hover:bg-zinc-900">
                <Plus size={14} />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-auto p-2">
              <div className="flex flex-col gap-1">
                <Button
                  variant="ghost"
                  size="xs"
                  className="justify-start gap-2"
                  onClick={() => {
                    channelCreateStore.send({ type: "setIsCreating", value: true });
                    channelCreateStore.send({ type: "setIsPrivate", value: false });
                    setPopoverOpen(false);
                  }}
                >
                  <Minus className="size-4 rotate-90 -ml-0.5" />
                  <span className="text-xs">Public Channel</span>
                </Button>
                <Button
                  variant="ghost"
                  size="xs"
                  className="justify-start gap-2"
                  onClick={() => {
                    channelCreateStore.send({ type: "setIsCreating", value: true });
                    channelCreateStore.send({ type: "setIsPrivate", value: true });
                    setPopoverOpen(false);
                  }}
                >
                  <LockIcon className="size-3 mr-0.5" />
                  <span className="text-xs">Private Channel</span>
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* Channel list */}
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* Create channel form - appears as first item in list */}
        {isCreating && (
          <div className="flex items-center pl-2 pr-1 py-1 mb-2 gap-1">
            <button
              className="flex items-center hover:bg-foreground/20 rounded-md h-full"
              onClick={() => channelCreateStore.send({ type: "setIsPrivate", value: !isPrivate })}
            >
              {isPrivate ? (
                <LockIcon className="size-3 shrink-0 mx-1" />
              ) : (
                <Minus className="size-5 rotate-90 shrink-0" />
              )}
            </button>

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
                if (e.key === "Enter") {
                  handleCreateChannel();
                } else if (e.key === "Escape") {
                  reset();
                }
              }}
              placeholder="channel-name"
              className="text-sm bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground truncate"
              autoFocus
            />
          </div>
        )}

        {isLoading && (
          <div className="px-2 py-1 text-sm text-muted-foreground">Loading channels...</div>
        )}

        {error && <div className="px-2 py-1 text-sm text-destructive">Failed to load channels</div>}

        {/* Public channels */}
        {sortedChannels.public.length > 0 && (
          <span className="pl-3 text-xs text-muted-foreground">PUBLIC</span>
        )}
        {sortedChannels.public.map((channel) => (
          <SidebarChannel key={channel.id} channel={channel} />
        ))}

        {/* Separator */}
        <div className="h-5" />

        {/* Private channels */}
        {sortedChannels.private.length > 0 && (
          <span className="pl-3 text-xs text-muted-foreground">PRIVATE</span>
        )}
        {sortedChannels.private.map((channel) => (
          <SidebarChannel key={channel.id} channel={channel} />
        ))}

        {channels?.length === 0 && !isLoading && !isCreating && (
          <div className="px-2 py-1 text-sm text-muted-foreground">No channels yet</div>
        )}
      </div>

      {/* Footer - pinned to bottom */}
      <div className="flex items-center justify-between p-2 mt-auto">
        <Button size="icon-sm" variant="ghost" onClick={goToPreferences}>
          <img className="rounded-md size-5" src={user?.imageUrl} />
        </Button>
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
  const { goToChannel } = useNavigation();
  const params = useParams({ strict: false }) as { channelId?: string };

  const selectChannel = useCallback(() => {
    goToChannel(channel.id);
  }, [channel.id, goToChannel]);

  const isSelectedChannel = params.channelId === channel.id;

  return (
    <Button
      {...props}
      variant="ghost"
      size="sm"
      className={cn(
        "w-full justify-start items-center py-0.5 h-6 rounded-none gap-1",
        "hover:!bg-card",
        isSelectedChannel && "bg-muted"
      )}
      onClick={selectChannel}
    >
      {channel.isPrivate ? (
        <LockIcon className="size-3" />
      ) : (
        <Minus className="-ml-1 size-5 rotate-90" />
      )}
      <span className="mt-0.5 truncate">{channel.name}</span>
    </Button>
  );
}
