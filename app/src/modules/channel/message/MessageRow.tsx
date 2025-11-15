import { useCallback } from "react";
import { Message } from "../types";
import { DateTime } from "luxon";
import { Clock, AlertCircle } from "lucide-react";
import { cn } from "../../../lib/utils";

export function MessageRow({ message }: { message: Message }) {
  const formatMessageTime = useCallback(
    (timestamp: Date | string) => DateTime.fromJSDate(new Date(timestamp)).toFormat("h:mm a"),
    []
  );

  const isPending = message.status === "pending";
  const isError = message.status === "error";

  return (
    <div
      className={cn(
        "px-4 py-2 text-sm hover:bg-muted transition-opacity",
        isPending && "opacity-60",
        isError && "opacity-50"
      )}
    >
      <div className="flex items-center gap-2 mb-1">
        {message.user?.imageUrl && (
          <img src={message.user.imageUrl} alt="" className="w-6 h-6 rounded-md" />
        )}
        <div className="space-x-2 flex items-center">
          <span className="font-semibold text-foreground">
            {message.user?.firstName && message.user?.lastName
              ? `${message.user.firstName} ${message.user.lastName}`
              : message.user?.emailAddress || "Unknown User"}
          </span>
          <span className="text-muted-foreground text-xs flex items-center gap-1">
            {formatMessageTime(message.createdAt)}
            {isPending && <Clock className="size-3 animate-pulse" />}
            {isError && <AlertCircle className="size-3 text-destructive" />}
          </span>
        </div>
      </div>
      <div className={cn("text-foreground", isError && "text-destructive")}>
        {message.content}
        {isError && <span className="text-xs text-destructive ml-2">(Failed to send)</span>}
      </div>
    </div>
  );
}
