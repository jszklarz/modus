import { useEffect } from "react";
import { useLocation } from "@tanstack/react-router";

const STORAGE_KEY = "lastNonPreferencesPath";

/**
 * Hook to track and retrieve the last non-preferences path
 * Uses session storage to persist across preferences navigation
 */
export function useNavigationHistory() {
  const location = useLocation();

  // Track non-preferences paths
  useEffect(() => {
    if (!location.pathname.startsWith("/preferences")) {
      sessionStorage.setItem(STORAGE_KEY, location.pathname);
    }
  }, [location.pathname]);

  /**
   * Get the last non-preferences path, or fallback to dashboard
   */
  const getLastNonPreferencesPath = (): string => {
    return sessionStorage.getItem(STORAGE_KEY) || "/";
  };

  return {
    getLastNonPreferencesPath,
  };
}
