import { HTMLAttributes } from "react";
import CmdPanel from "../cmd/CmdPanel";
import { useNavigation } from "../hooks/useNavigation";
import { Button } from "../../components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useNavigationHistory } from "../hooks/useNavigationHistory";
import { useNavigate } from "@tanstack/react-router";

export default function DashboardHeader(props: HTMLAttributes<HTMLDivElement>) {
  const { isPreferencesRoute } = useNavigation();
  const navigate = useNavigate();
  const { getLastNonPreferencesPath } = useNavigationHistory();

  const handleBack = () => {
    // Navigate to the last non-preferences path (falls back to dashboard)
    const lastPath = getLastNonPreferencesPath();
    navigate({ to: lastPath as any });
  };

  return (
    <div {...props}>
      {isPreferencesRoute && (
        <button
          className="flex items-center hover:bg-muted transition-all duration-300 px-1.5 rounded-md"
          onClick={handleBack}
        >
          <ChevronLeft className="size-4" />
        </button>
      )}

      {/* Separator */}
      <div className="grow" />

      {/* Cmd Panel */}
      <CmdPanel className="py-1 px-2 w-1/4 min-w-[700px]" context="global" />

      {/* Separator */}
      <div className="grow" />
    </div>
  );
}
