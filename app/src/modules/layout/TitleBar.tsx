import { ChevronsUpDown, Minus, X } from "lucide-react";
import { useCallback } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";

export function TitleBarMain() {
  return <div id="main-title-bar" data-tauri-drag-region className="w-full h-2.5" />;
}

export function TitleBarLeft() {
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
    <div
      id="left-title-bar"
      data-tauri-drag-region
      className="w-full px-2 py-1 pb-0 h-6 flex items-center"
    >
      <div className="group w-fit space-x-2">
        {/* buttons for close, minimize, fullscreen */}
        <button
          className="p-[2px] rounded-full bg-zinc-700 group-hover:bg-red-500 cursor-default"
          onClick={windowClose}
        >
          <X className="size-2 opacity-0 group-hover:opacity-100 stroke-black" />
        </button>
        <button
          className="p-[2px] rounded-full bg-zinc-700 group-hover:bg-yellow-500 cursor-default"
          onClick={windowMinimize}
        >
          <Minus className="size-2 opacity-0 group-hover:opacity-100 stroke-black" />
        </button>
        <button
          className="p-[2px] rounded-full bg-zinc-700 group-hover:bg-green-500 cursor-default"
          onClick={windowMaximize}
        >
          <ChevronsUpDown className="size-2 opacity-0 group-hover:opacity-100 stroke-black -rotate-45" />
        </button>
      </div>
    </div>
  );
}
