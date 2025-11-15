// This store the state of the keymap module.
// Right now we store it in memory however in the future we should adopt a persistent local storage solution.

import type { CmdKey } from "../cmd/cmd";

/**
 * Represents a key combination (e.g., "cmd+shift+i")
 * Format: [modifier+]*key
 * Modifiers: cmd, ctrl, shift, alt (lowercase)
 */
export type KeyCombination = string;

/**
 * Internal action types for system operations
 */
export type SystemAction = "open-cmd" | "close-cmd";

/**
 * A keymap entry can either trigger a command or a system action
 */
export type KeymapAction =
  | { type: "command"; cmdKey: CmdKey }
  | { type: "system"; action: SystemAction };

/**
 * Maps key combinations to their actions
 */
export type Keymap = Record<KeyCombination, KeymapAction>;

/**
 * Default keymap configuration
 */
export const keymap: Keymap = {
  "/": {
    type: "system",
    action: "open-cmd",
  },
  "cmd+i": {
    type: "command",
    cmdKey: "invite-channel",
  },
  "cmd+shift+i": {
    type: "command",
    cmdKey: "invite-org",
  },
  "cmd+shift+f": {
    type: "command",
    cmdKey: "search",
  },
};

/**
 * Normalizes a keyboard event to a key combination string
 * @param e KeyboardEvent
 * @returns Normalized key combination (e.g., "cmd+shift+i")
 */
export const eventToKeyCombination = (e: KeyboardEvent): KeyCombination => {
  const parts: string[] = [];

  // Add modifiers in consistent order
  if (e.metaKey) parts.push("cmd");
  if (e.ctrlKey) parts.push("ctrl");
  if (e.altKey) parts.push("alt");
  if (e.shiftKey) parts.push("shift");

  // Add the main key (lowercase)
  const key = e.key.toLowerCase();
  parts.push(key);

  return parts.join("+");
};

/**
 * Finds the keyboard shortcut for a given command key
 * @param cmdKey The command key to search for
 * @returns The key combination that triggers this command, or undefined if none found
 */
export const getShortcutForCommand = (cmdKey: CmdKey): KeyCombination | undefined => {
  const entry = Object.entries(keymap).find(
    ([, action]) => action.type === "command" && action.cmdKey === cmdKey
  );
  return entry?.[0];
};
