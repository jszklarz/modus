import { useMatchRoute } from "@tanstack/react-router";
import { useSelector } from "@xstate/store/react";
import { useCallback, useEffect } from "react";
import { TitleBarLeft } from "../layout/TitleBar";
import { layoutStore } from "../store/layout.store";
import { ChannelSidebar } from "./ChannelSidebar";
import PreferencesSidebar from "./PreferencesSidebar";
import { useNavigation } from "../hooks/useNavigation";

export default function LeftSidebar() {
  const nav = useNavigation();

  const { leftSidebarWidth, isResizingLeft, isResizingRight } = useSelector(
    layoutStore,
    (state) => state.context
  );
  const handleLeftMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    layoutStore.send({ type: "startResizingLeft" });
  }, []);

  const handleMouseUp = useCallback(() => {
    layoutStore.send({ type: "stopResizing" });
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isResizingLeft || isResizingRight) {
        e.preventDefault();
      }

      if (isResizingLeft) {
        const newWidth = e.clientX;
        layoutStore.send({ type: "setLeftSidebarWidth", width: newWidth });
      }

      if (isResizingRight) {
        const newWidth = window.innerWidth - e.clientX;
        layoutStore.send({ type: "setRightSidebarWidth", width: newWidth });
      }
    },
    [isResizingLeft, isResizingRight]
  );

  // Add global mouse event listeners
  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove as any);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove as any);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  useEffect(() => {
    if (isResizingLeft || isResizingRight) {
      document.body.style.userSelect = "none";
      document.body.style.cursor = "col-resize";
    } else {
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    }
  }, [isResizingLeft, isResizingRight]);

  return (
    <div
      className="h-full bg-muted relative flex-shrink-0 flex flex-col"
      style={{ width: `${leftSidebarWidth}px` }}
    >
      {/* Custom Window titlebar section */}
      <TitleBarLeft />

      {/* Sidebar content - takes remaining height */}
      <div className="flex-1 overflow-hidden">
        {nav.isPreferencesRoute ? <PreferencesSidebar /> : <ChannelSidebar />}
      </div>

      {/* Resize handle */}
      <div
        className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary transition-colors"
        onMouseDown={handleLeftMouseDown}
      />
    </div>
  );
}
