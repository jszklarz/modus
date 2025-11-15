import { HTMLAttributes } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { cn } from "../../lib/utils";
import { useNavigation } from "../hooks/useNavigation";
import { useNavigationHistory } from "../hooks/useNavigationHistory";
import { User, Building2, ChevronLeft } from "lucide-react";
import { Button } from "../../components/ui/button";

type PreferencesSection = {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  navFn: () => void;
};

export default function PreferencesSidebar(props: HTMLAttributes<HTMLDivElement>) {
  const location = useLocation();
  const navigate = useNavigate();
  const { goToPreferences, goToOrgPreferences } = useNavigation();

  const preferencesSections: PreferencesSection[] = [
    {
      id: "profile",
      label: "Profile",
      icon: <User className="size-3" />,
      path: "/preferences/profile",
      navFn: goToPreferences,
    },
    {
      id: "organisations",
      label: "Organisations",
      icon: <Building2 className="size-3" />,
      path: "/preferences/organisation",
      navFn: goToOrgPreferences,
    },
  ];

  return (
    <div {...props} className={cn("flex flex-col h-full", props.className)}>
      {/* Preferences navigation */}
      <nav className="flex-1 flex flex-col pt-2">
        <div className="flex items-center pb-2 pl-2 gap-1">
          <span className="text-xs text-foreground/70 pt-0.5">PREFERENCES</span>
        </div>
        {preferencesSections.map((section) => {
          const isActive = location.pathname === section.path;

          return (
            <Button
              key={section.id}
              variant="ghost"
              size="sm"
              className={cn(
                "w-full justify-start items-center py-0.5 h-6 rounded-none gap-1.5",
                "hover:!bg-card",
                isActive && "bg-muted"
              )}
              onClick={section.navFn}
            >
              {section.icon}
              <span className="text-sm truncate">{section.label}</span>
            </Button>
          );
        })}
      </nav>
    </div>
  );
}
