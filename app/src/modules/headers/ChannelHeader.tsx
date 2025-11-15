import { useParams } from "@tanstack/react-router";
import { ChevronLeft, Copy, CopyCheck, LayoutDashboard, Minus } from "lucide-react";
import { HTMLAttributes, useCallback, useState } from "react";
import { Button } from "../../components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover";
import { trpc } from "../../trpc";
import CmdPanel from "../cmd/CmdPanel";
import { useNavigation } from "../hooks/useNavigation";

export default function ChannelHeader(props: HTMLAttributes<HTMLDivElement>) {
  const params = useParams({ strict: false }) as { channelId?: string };
  const { goToDashboard } = useNavigation();

  // Fetch the channel data
  const { data: channels } = trpc.getChannels.useQuery();
  const selectedChannel = channels?.find((c) => c.id === params.channelId);

  if (!selectedChannel) {
    return null;
  }

  return (
    <div {...props}>
      {/* Back to dashboard button */}
      <button
        className="flex items-center hover:bg-muted transition-all duration-300 px-2 rounded-md"
        onClick={goToDashboard}
      >
        <ChevronLeft className="size-4" />
        <LayoutDashboard className="size-4" />
      </button>

      {/* Channel popover */}
      <Popover>
        <PopoverTrigger asChild>
          <button className="flex items-center hover:bg-muted transition-all duration-300 pr-2 rounded-md">
            <Minus className="size-5 rotate-90" />
            <div className="max-w-52 truncate">
              <span>{selectedChannel?.name}</span>
            </div>
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto bg-secondary shadow-lg">
          <ChannelInfo />
        </PopoverContent>
      </Popover>

      {/* Separator */}
      <div className="grow" />

      {/* Cmd Panel */}
      <CmdPanel className="py-1 px-2 w-1/4 min-w-[700px]" context="channel" />

      {/* Separator */}
      <div className="grow" />

      {/* Channel actions */}
      <div></div>
    </div>
  );
}

function ChannelInfo() {
  const params = useParams({ strict: false }) as { channelId?: string };
  const { goToDashboard } = useNavigation();

  // Fetch the channel data
  const { data: channels } = trpc.getChannels.useQuery();
  const selectedChannel = channels?.find((c) => c.id === params.channelId);

  const [leaveClicked, setLeaveClicked] = useState(false);
  const [deleteClicked, setDeleteClicked] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const utils = trpc.useUtils();

  const leaveMutation = trpc.leaveChannel.useMutation({
    onSuccess: () => {
      utils.getChannels.invalidate();
      goToDashboard();
    },
  });

  const deleteMutation = trpc.deleteChannel.useMutation({
    onSuccess: () => {
      utils.getChannels.invalidate();
      setDeleteClicked(false);
    },
    onError: (e) => console.error(e),
  });

  const copyId = useCallback(() => {
    if (selectedChannel?.id) {
      navigator.clipboard.writeText(selectedChannel.id).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 1000);
      });
    }
  }, [selectedChannel?.id]);

  const leaveChannel = useCallback(() => {
    if (selectedChannel?.id) {
      leaveMutation.mutate({ channelId: selectedChannel.id });
    }
  }, [selectedChannel?.id, leaveMutation]);

  const deleteChannel = useCallback(() => {
    if (selectedChannel?.id) {
      deleteMutation.mutate({ channelId: selectedChannel.id });
    }
  }, [selectedChannel?.id, deleteMutation]);

  if (!selectedChannel) return null;

  return (
    <div className="space-y-4 min-w-[320px]">
      {/* Channel type */}
      <div>
        <p className="text-xs text-muted-foreground uppercase font-medium mb-1">Type</p>
        <p className="text-sm text-foreground">
          {selectedChannel.isPrivate ? "Private" : "Public"}
        </p>
      </div>

      {/* Created date */}
      <div>
        <p className="text-xs text-muted-foreground uppercase font-medium mb-1">Created</p>
        <p className="text-sm text-foreground">
          {selectedChannel.createdAt
            ? new Date(selectedChannel.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : "Unknown"}
        </p>
      </div>

      {/* Channel id */}
      <div>
        <p className="text-xs text-muted-foreground uppercase font-medium mb-1">ID</p>
        <div className="flex items-center gap-1">
          <p className="mt-1 text-sm text-foreground">{selectedChannel.id}</p>
          <button onClick={copyId} className="hover:bg-muted p-1 rounded-md">
            {isCopied ? <CopyCheck className="size-4" /> : <Copy className="size-4" />}
          </button>
        </div>
      </div>

      {/* Action buttons */}
      <div className="pt-2 border-t border-border flex items-center gap-2">
        {leaveClicked && (
          <>
            <span className="grow">Are you really leaving?</span>
            <Button variant="destructive" size="sm" onClick={leaveChannel}>
              Yes
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setLeaveClicked(false)}>
              No
            </Button>
          </>
        )}

        {deleteClicked && (
          <>
            <span className="grow">Are you really deleting?</span>
            <Button variant="destructive" size="sm" onClick={deleteChannel}>
              Yes
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setDeleteClicked(false)}>
              No
            </Button>
          </>
        )}

        {!leaveClicked && !deleteClicked && (
          <>
            <Button
              variant="destructive"
              size="sm"
              className="flex-1"
              onClick={() => setLeaveClicked(true)}
            >
              {leaveClicked ? "Are you sure?" : "Leave channel"}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="flex-1"
              onClick={() => {
                deleteClicked ? deleteChannel() : setDeleteClicked(true);
              }}
            >
              {deleteClicked ? "Are you sure?" : "Delete channel"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
