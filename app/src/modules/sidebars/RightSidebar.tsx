import { useSelector } from "@xstate/store/react";
import { layoutStore } from "../store/layout.store";
import { useCallback } from "react";

export default function RightSidebar() {
  const { isRightOpen, rightSidebarWidth } = useSelector(layoutStore, (state) => state.context);

  const handleRightMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    layoutStore.send({ type: "startResizingRight" });
  }, []);

  if (!isRightOpen) return null;

  return (
    <div
      className="h-full bg-zinc-800 relative flex-shrink-0"
      style={{ width: `${rightSidebarWidth}px` }}
    >
      {/* Resize handle */}
      <div
        className="absolute top-0 left-0 w-1 h-full cursor-col-resize hover:bg-blue-500 transition-colors"
        onMouseDown={handleRightMouseDown}
      />
      <div className="w-full h-full p-4 text-white">Right Sidebar</div>
    </div>
  );
}
