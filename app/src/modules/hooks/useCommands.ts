import { useCallback } from "react";
import { useNavigation } from "./useNavigation";
import type { CmdKey } from "../cmd/cmd";

/**
 * Hook that provides command execution functions
 * Centralizes all command actions with access to router navigation
 */
export function useCommands() {
  const { goToDashboard, goToPreferences, goToChannel } = useNavigation();

  /**
   * Execute a command by its key with optional arguments
   */
  const executeCommand = useCallback(
    (cmdKey: CmdKey, args?: string[]) => {
      console.log(`Executing command: ${cmdKey}`, args);
      switch (cmdKey) {
        case "invite-channel":
          return;
        case "invite-org":
          return;
        case "create-channel":
          return;
        case "search":
          return;
        case "preferences-profile":
          goToPreferences();
          return;
        default:
          console.warn(`Unknown command: ${cmdKey}`);
      }
    },
    [goToDashboard, goToPreferences, goToChannel]
  );

  return {
    executeCommand,
  };
}
