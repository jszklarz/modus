import { createStore } from "@xstate/store";

export type Theme = "dark" | "light";

export const themeStore = createStore({
  context: {
    theme: "dark" as Theme,
  },
  on: {
    setTheme: (context, event: { theme: Theme }) => ({
      ...context,
      theme: event.theme,
    }),
    toggleTheme: (context) => ({
      ...context,
      theme: (context.theme === "dark" ? "light" : "dark") as Theme,
    }),
  },
});
