import { useCallback } from "react";
import { useMatchRoute, useNavigate } from "@tanstack/react-router";

/**
 * Navigation hook that provides centralized routing functions
 */
export function useNavigation() {
  const navigate = useNavigate();
  const matchRoute = useMatchRoute();

  const isDashboardRoute = matchRoute({ to: "/", fuzzy: false });
  const isPreferencesRoute = matchRoute({ to: "/preferences", fuzzy: true });
  const isChannelRoute = matchRoute({ to: "/channel/$channelId", fuzzy: false });

  const goToDashboard = useCallback(() => {
    navigate({ to: "/" });
  }, [navigate]);

  const goToPreferences = useCallback(() => {
    if (isPreferencesRoute) return;
    navigate({ to: "/preferences/profile" });
  }, [navigate, isPreferencesRoute]);

  const goToOrgPreferences = useCallback(() => {
    navigate({ to: "/preferences/organization" });
  }, [navigate]);

  const goToChannel = useCallback(
    (channelId: string) => {
      navigate({ to: "/channel/$channelId", params: { channelId } });
    },
    [navigate]
  );

  return {
    isPreferencesRoute,
    isDashboardRoute,
    isChannelRoute,
    goToDashboard,
    goToChannel,
    goToPreferences,
    goToOrgPreferences,
  };
}
