import { ChevronsUpDown, Minus, X } from "lucide-react";
import { useCallback } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useSelector } from "@xstate/store/react";
import { titleBarStore } from "../store/titlebar.store";

// Small fixed-height title bar to provide an extra handle to drag the window around.
export function TitleBarMain() {
  const handleDoubleClick = useCallback(async () => {
    const window = getCurrentWindow();
    const isMaximized = await window.isMaximized();
    if (isMaximized) {
      await window.unmaximize();
    } else {
      await window.maximize();
    }
  }, []);

  const handleMouseEnter = useCallback(() => {
    titleBarStore.send({ type: "setHovered", isHovered: true });
  }, []);

  const handleMouseLeave = useCallback(() => {
    titleBarStore.send({ type: "setHovered", isHovered: false });
  }, []);

  return (
    <div
      id="main-title-bar"
      data-tauri-drag-region
      className="w-full h-2.5 bg-secondary"
      onDoubleClick={handleDoubleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    />
  );
}

// Main title bar in the left sidebar that contains the window buttons + draggable space.
export function TitleBarLeft() {
  const handleDoubleClick = useCallback(async () => {
    const window = getCurrentWindow();
    const isMaximized = await window.isMaximized();
    if (isMaximized) {
      await window.unmaximize();
    } else {
      await window.maximize();
    }
  }, []);

  const handleMouseEnter = useCallback(() => {
    titleBarStore.send({ type: "setHovered", isHovered: true });
  }, []);

  const handleMouseLeave = useCallback(() => {
    titleBarStore.send({ type: "setHovered", isHovered: false });
  }, []);

  return (
    <div
      id="left-title-bar"
      data-tauri-drag-region
      className="w-full px-2 py-0.5 pb-0 h-6 flex items-center bg-secondary justify-between"
      onDoubleClick={handleDoubleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <WindowButtons />
    </div>
  );
}

// The title bar that spans the entire window (used for full width screens like no-auth screens)
export function FullTitleBar() {
  const handleDoubleClick = useCallback(async () => {
    const window = getCurrentWindow();
    const isMaximized = await window.isMaximized();
    if (isMaximized) {
      await window.unmaximize();
    } else {
      await window.maximize();
    }
  }, []);

  const handleMouseEnter = useCallback(() => {
    titleBarStore.send({ type: "setHovered", isHovered: true });
  }, []);

  const handleMouseLeave = useCallback(() => {
    titleBarStore.send({ type: "setHovered", isHovered: false });
  }, []);

  return (
    <div
      id="full-title-bar"
      data-tauri-drag-region
      className="w-full px-2 py-0.5 pb-0 h-6 flex items-center bg-secondary"
      onDoubleClick={handleDoubleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <WindowButtons />
    </div>
  );
}

function WindowButtons() {
  const { isHovered } = useSelector(titleBarStore, (state) => state.context);

  const windowClose = useCallback(async () => {
    const window = getCurrentWindow();
    await window.close();
  }, []);

  const windowMinimize = useCallback(async () => {
    const window = getCurrentWindow();
    await window.minimize();
  }, []);

  const windowMaximize = useCallback(async () => {
    const window = getCurrentWindow();
    const isMaximized = await window.isMaximized();
    if (isMaximized) {
      await window.unmaximize();
    } else {
      await window.maximize();
    }
  }, []);

  return (
    <div className="w-fit space-x-2">
      {/* buttons for close, minimize, fullscreen */}
      <button
        className={`p-[2px] rounded-full transition-colors cursor-default ${
          isHovered ? "bg-red-500" : "bg-[hsl(var(--window-button))]"
        }`}
        onClick={windowClose}
      >
        <X
          className={`size-2 stroke-black transition-opacity ${isHovered ? "opacity-100" : "opacity-0"}`}
        />
      </button>
      <button
        className={`p-[2px] rounded-full transition-colors cursor-default ${
          isHovered ? "bg-yellow-500" : "bg-[hsl(var(--window-button))]"
        }`}
        onClick={windowMinimize}
      >
        <Minus
          className={`size-2 stroke-black transition-opacity ${isHovered ? "opacity-100" : "opacity-0"}`}
        />
      </button>
      <button
        className={`p-[2px] rounded-full transition-colors cursor-default ${
          isHovered ? "bg-green-500" : "bg-[hsl(var(--window-button))]"
        }`}
        onClick={windowMaximize}
      >
        <ChevronsUpDown
          className={`size-2 stroke-black -rotate-45 transition-opacity ${isHovered ? "opacity-100" : "opacity-0"}`}
        />
      </button>
    </div>
  );
}
