import { createRootRoute, createRoute, createRouter, redirect } from "@tanstack/react-router";
import { LayoutContainer } from "../layout/LayoutContainer";
import { DashboardPage } from "../dashboard/DashboardPage";
import ChannelPage from "../channel/ChannelPage";
import ProfilePreferences from "../preferences/ProfilePreferences";
import OrgPreferences from "../preferences/OrgPreferences";

// Root route - contains the layout
const rootRoute = createRootRoute({
  component: LayoutContainer,
});

// Dashboard route
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: DashboardPage,
});

// Settings route - redirects to profile by default
const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/preferences",
  beforeLoad: () => {
    throw redirect({ to: "/preferences/profile" });
  },
});

// Settings - Profile
const settingsProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/preferences/profile",
  component: ProfilePreferences,
});

// Settings - Organisations
const settingsOrganisationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/preferences/organization",
  component: OrgPreferences,
});

// Channel route with dynamic ID
const channelRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/channel/$channelId",
  component: ChannelPage,
});

// Create route tree
const routeTree = rootRoute.addChildren([
  dashboardRoute,
  settingsRoute,
  settingsProfileRoute,
  settingsOrganisationsRoute,
  channelRoute,
]);

// Create and export router
export const router = createRouter({ routeTree });

// Register router type for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
