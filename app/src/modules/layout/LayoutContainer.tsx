import { useSelector } from "@xstate/store/react";
import { useCallback, useEffect } from "react";
import { default as ChannelPage } from "../channel-messages/ChannelPage";
import { DashboardPage } from "../dashboard/DashboardPage";
import { LeftSidebar } from "../sidebars/LeftSidebar";
import { channelStore } from "../store/channel.store";
import { layoutStore } from "../store/layout.store";
import { TitleBarMain } from "./TitleBar";
import RightSidebar from "../sidebars/RightSidebar";

export function LayoutContainer() {
  const { selectedChannel } = useSelector(channelStore, (state) => state.context);
  const layoutState = useSelector(layoutStore, (state) => state.context);
  const { leftSidebarWidth, isResizingLeft, isResizingRight } = layoutState;

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

  // Disable text selection globally when resizing
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
      className="w-full h-full flex"
      style={{ userSelect: isResizingLeft || isResizingRight ? "none" : "auto" }}
    >
      {/* Left sidebar container */}
      <div
        className="h-full bg-muted relative flex-shrink-0"
        style={{ width: `${leftSidebarWidth}px` }}
      >
        <LeftSidebar className="w-full h-full" />
        {/* Resize handle */}
        <div
          className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary transition-colors"
          onMouseDown={handleLeftMouseDown}
        />
      </div>

      {/* Main section container */}
      <div className="w-full h-full">
        <TitleBarMain />

        <div className="w-full h-full flex">
          {/* Page container */}
          <div className="flex-1 h-full bg-card text-card-foreground flex items-center justify-center rounded-md">
            <div className="w-full h-full flex flex-col">
              {selectedChannel ? <ChannelPage /> : <DashboardPage />}
            </div>
          </div>

          {/* Right sidebar container */}
          <RightSidebar />
        </div>
      </div>
    </div>
  );
}
