import { useSelector } from "@xstate/store/react";
import { HTMLAttributes, useEffect } from "react";
import { cn } from "../../lib/utils";
import { cmdStore } from "../store/cmd.store";
import { CmdType } from "./cmd";
import CmdExec from "./CmdExec";
import CmdSearch from "./CmdSearch";

// The container for both Cmd search and Cmd execution.
// Flows:
//
// 1. "/" -> Panel shows with cmd search input -> select a cmd -> Panel shows with cmd execution input
//
// 2. command shortcut pressed -> Panel shows with cmd execution input

type CmdPanelProps = {
  context: CmdType;
} & HTMLAttributes<HTMLDivElement>;

export default function CmdPanel({ context, ...props }: CmdPanelProps) {
  const { isOpen, cmdContext, selectedCmd } = useSelector(cmdStore, (state) => state.context);

  // Sync the prop context with the store when it changes
  useEffect(() => {
    if (context !== cmdContext) {
      cmdStore.send({ type: "setCmdContext", cmdContext: context });
    }
  }, [context, cmdContext]);

  return (
    <div
      {...props}
      className={cn("bg-muted gap-2", isOpen ? "opacity-100" : "opacity-0", props.className)}
    >
      <div className="flex items-center bg-background relative px-1">
        {selectedCmd ? <CmdExec cmd={selectedCmd} /> : <CmdSearch />}
      </div>
    </div>
  );
}
