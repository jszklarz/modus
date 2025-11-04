import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

// Initialize Neutralino if available
if (window.Neutralino) {
  Neutralino.init();

  // Handle window close event
  Neutralino.events.on("windowClose", () => {
    Neutralino.app.exit();
  });

  // Set up tray menu (if not on macOS)
  if (window.NL_OS !== "Darwin") {
    Neutralino.os.setTray({
      icon: "/resources/icons/trayIcon.png",
      menuItems: [{ id: "QUIT", text: "Quit" }],
    });

    Neutralino.events.on("trayMenuItemClicked", (event: any) => {
      if (event.detail.id === "QUIT") {
        Neutralino.app.exit();
      }
    });
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
