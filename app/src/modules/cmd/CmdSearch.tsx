import { Input } from "@base-ui-components/react";
import { useSelector } from "@xstate/store/react";
import { Search } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { cn } from "../../lib/utils";
import { getShortcutForCommand } from "../keymap/keymap";
import Shortcut from "../keymap/Shortcut";
import { cmdStore } from "../store/cmd.store";
import { CmdAction, CmdKey, searchCmds } from "./cmd";
import { useCommands } from "../hooks/useCommands";

export default function CmdSearch() {
  const { executeCommand } = useCommands();
  const { isOpen, search, focusedIndex, cmdContext } = useSelector(
    cmdStore,
    (state) => state.context
  );
  const inputRef = useRef<HTMLInputElement>(null);

  // Derive results from search + context
  const results = useMemo(() => searchCmds(search, cmdContext), [search, cmdContext]);

  // Focus input when it opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  return (
    <>
      <Search className="size-3" />
      <Input
        ref={inputRef}
        className="grow px-1 bg-transparent outline-none focus:outline-none"
        value={search}
        onChange={(e) => cmdStore.send({ type: "setSearch", search: e.target.value })}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.preventDefault();
            cmdStore.send({ type: "close" });
          } else if (e.key === "Tab") {
            e.preventDefault();
            const direction = e.shiftKey ? "up" : "down";
            cmdStore.send({ type: "navigate", direction, resultsCount: results.length });
          } else if (e.key === "ArrowDown") {
            e.preventDefault();
            cmdStore.send({ type: "navigate", direction: "down", resultsCount: results.length });
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            cmdStore.send({ type: "navigate", direction: "up", resultsCount: results.length });
          } else if (e.key === "Enter") {
            e.preventDefault();

            const focused = results[focusedIndex];
            if (focused) {
              // Select the focused command
              if (focused.action.template) {
                cmdStore.send({
                  type: "selectCmd",
                  cmd: { key: focused.key, action: focused.action },
                });
              } else {
                executeCommand(focused.key);
                inputRef.current?.blur();
              }
            }
          }
        }}
        onBlur={() => cmdStore.send({ type: "close" })}
        disabled={!isOpen}
      />
      {isOpen && <CmdSearchMenu results={results} focusedIndex={focusedIndex} />}
    </>
  );
}

function CmdSearchMenu({
  results,
  focusedIndex,
}: {
  results: Array<{ key: CmdKey; action: CmdAction }>;
  focusedIndex: number;
}) {
  const { executeCommand } = useCommands();

  if (results.length === 0) {
    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border p-2">
        <div className="text-muted-foreground text-sm">No commands found</div>
      </div>
    );
  }

  const handleSelect = (option: { key: CmdKey; action: CmdAction }) => {
    if (option.action.template) {
      cmdStore.send({
        type: "selectCmd",
        cmd: { key: option.key, action: option.action },
      });
    } else {
      executeCommand(option.key);
      cmdStore.send({ type: "close" });
    }
  };

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border shadow-lg">
      {results.map((option, index) => (
        <CmdOption
          key={option.key}
          option={option}
          isFocused={index === focusedIndex}
          onSelect={handleSelect}
        />
      ))}
    </div>
  );
}

function CmdOption({
  option,
  isFocused,
  onSelect,
}: {
  option: { key: CmdKey; action: CmdAction };
  isFocused: boolean;
  onSelect: (option: { key: CmdKey; action: CmdAction }) => void;
}) {
  const shortcut = getShortcutForCommand(option.key);

  return (
    <div
      className={cn(
        "px-2 py-0.5 flex items-center justify-between gap-2 text-xs hover:bg-muted/70 cursor-pointer",
        isFocused && "hover:bg-accent/20 bg-accent/20 text-accent-foreground"
      )}
      onMouseDown={(e) => {
        e.preventDefault(); // Prevent blur from firing before click
        onSelect(option);
      }}
    >
      <span>
        {option.action.cmd}: {option.action.description}
      </span>
      {shortcut && <Shortcut shortcut={shortcut} />}
    </div>
  );
}
