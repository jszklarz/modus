export type CmdKey =
  | "invite-channel"
  | "invite-org"
  | "create-channel"
  | "search"
  | "preferences-profile";
export type CmdType = "global" | "channel";
export type Cmds = Record<CmdKey, CmdAction>;
export type CmdAction = {
  // Command string - label shown
  cmd: string;
  // Description of the command
  description: string;
  // Context type where this command is applicable
  type: CmdType;
  // Search terms for better matching
  searchTerms?: string[];
  // Template for configurable commands
  template?: string;
  // Optional action to execute when command is run
  action?: (...args: string[]) => void;
};

export const cmds: Cmds = {
  search: {
    cmd: "/search",
    description: "Search for something globally",
    type: "global",
    searchTerms: ["search", "find", "global"],
    template: "$query",
  },
  "invite-channel": {
    cmd: "/invite-channel",
    description: "Invite members to this channel",
    type: "channel",
    searchTerms: ["invite", "add", "members", "channel", "people"],
    template: "@larry @barry",
  },
  "invite-org": {
    cmd: "/invite-org",
    description: "Invite members to your organization",
    type: "global",
    searchTerms: ["invite", "add", "members", "organization", "people"],
    template: "larry@qave.ai barry@qave.ai",
  },
  "create-channel": {
    cmd: "/create-channel",
    description: "Create a new channel in this organization",
    type: "global",
    searchTerms: ["create", "new", "channel", "organization", "team"],
    template: "channel-name1 channel-name2",
  },
  "preferences-profile": {
    cmd: "Preferences - Profile",
    description: "Opens the profile preferences",
    type: "global",
    searchTerms: ["preferences", "settings", "profile", "account"],
  },
};

/**
 * Search commands by query string and context
 * Returns matching command keys and their actions
 * Matches against: command key, description, and search terms
 *
 * Context filtering logic:
 * - "global": shows only global commands (not in a channel)
 * - "channel": shows channel-specific commands + global commands (in a channel)
 */
export const searchCmds = (
  query: string,
  context: CmdType
): Array<{ key: CmdKey; action: CmdAction }> => {
  // Filter by context first
  const contextFiltered = Object.entries(cmds).filter(([, action]) => {
    // If we're in global context, show only global commands
    if (context === "global") {
      return action.type === "global";
    }
    // If we're in a channel context, show channel commands + global commands
    return action.type === context || action.type === "global";
  });

  // If no query, return all context-filtered commands
  if (!query.trim()) {
    return contextFiltered.map(([key, action]) => ({ key: key as CmdKey, action }));
  }

  // Filter by query
  const lowerQuery = query.toLowerCase();
  return contextFiltered
    .filter(([key, action]) => {
      // Match against command key
      if (key.toLowerCase().includes(lowerQuery)) {
        return true;
      }

      // Match against description
      if (action.description.toLowerCase().includes(lowerQuery)) {
        return true;
      }

      // Match against search terms (if provided)
      if (action.searchTerms) {
        return action.searchTerms.some((term) => term.toLowerCase().includes(lowerQuery));
      }

      return false;
    })
    .map(([key, action]) => ({ key: key as CmdKey, action }));
};
