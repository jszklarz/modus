import { useEffect } from "react";
import { useSelector } from "@xstate/store/react";
import { themeStore } from "../store/theme.store";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSelector(themeStore, (state) => state.context.theme);

  useEffect(() => {
    // Apply theme class to document element
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  return <>{children}</>;
}
