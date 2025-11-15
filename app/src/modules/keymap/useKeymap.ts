import { useEffect } from "react";
import { keymap, eventToKeyCombination } from "./keymap";
import { cmdStore } from "../store/cmd.store";
import { cmds } from "../cmd/cmd";

/**
 * Global keymap hook that handles keyboard shortcuts throughout the application.
 * Automatically registers and unregisters event listeners.
 */
export const useKeymap = () => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing in an input, textarea, or contenteditable
      const target = e.target as HTMLElement;
      const isTyping =
        target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;

      if (isTyping) {
        return;
      }

      // Convert keyboard event to key combination string
      const keyCombination = eventToKeyCombination(e);

      // Check if this key combination is mapped to an action
      const action = keymap[keyCombination];

      if (action) {
        e.preventDefault();

        // Handle system actions
        if (action.type === "system") {
          switch (action.action) {
            case "open-cmd":
              cmdStore.send({ type: "open", cmdContext: "global" });
              break;
            case "close-cmd":
              cmdStore.send({ type: "close" });
              break;
          }
        }
        // Handle command actions
        else if (action.type === "command") {
          // Open command palette with the command already selected
          cmdStore.send({ type: "open", cmdContext: "global" });
          cmdStore.send({
            type: "selectCmd",
            cmd: { key: action.cmdKey, action: cmds[action.cmdKey] }
          });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
};
