import { ChevronRight } from "lucide-react";
import { CmdAction, CmdKey } from "./cmd";
import { Input } from "@base-ui-components/react";
import { cn } from "../../lib/utils";
import { useState } from "react";
import { cmdStore } from "../store/cmd.store";

export default function CmdExec({ cmd }: { cmd: { key: CmdKey; action: CmdAction } }) {
  const [value, setValue] = useState("");

  return (
    <>
      <ChevronRight className="size-4" />
      <span className="text-sm text-muted-foreground pt-1">{cmd.action.cmd}</span>
      <Input
        className={cn(
          value && "pt-1",
          "text-sm grow px-1 bg-transparent outline-none focus:outline-none"
        )}
        value={value}
        autoFocus
        placeholder={cmd.action.template}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.preventDefault();
            cmdStore.send({ type: "selectCmd", cmd: null });
          } else if (e.key === "Tab") {
            e.preventDefault();
            setValue(`${value}  `); // Add 2 spaces <:)
          }
        }}
      />
    </>
  );
}
