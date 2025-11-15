import { Outlet } from "@tanstack/react-router";
import { motion } from "framer-motion";
import Header from "../headers/Header";
import LeftSidebar from "../sidebars/LeftSidebar";
import RightSidebar from "../sidebars/RightSidebar";
import { TitleBarMain } from "./TitleBar";
import { useNavigationHistory } from "../hooks/useNavigationHistory";

export function LayoutContainer() {
  // Track navigation history globally
  useNavigationHistory();

  return (
    <motion.div
      className="w-full h-full flex"
      initial={{
        opacity: 0,
        scale: 1.3,
      }}
      animate={{
        opacity: 1,
        scale: 1,
      }}
      transition={{
        duration: 5,
        ease: [0.25, 0.1, 0.25, 1],
        opacity: { duration: 5 },
      }}
    >
      {/* Left sidebar container */}
      <LeftSidebar />

      {/* Main section container */}
      <div className="w-full h-full flex flex-col">
        <TitleBarMain />

        <div className="w-full flex-1 flex overflow-hidden">
          {/* Page container */}
          <div className="flex-1 h-full bg-card text-card-foreground flex items-center justify-center rounded-tl-md">
            <div className="w-full h-full flex flex-col">
              <>
                {/* Header */}
                <Header />
                <Outlet />
              </>
            </div>
          </div>

          {/* Right sidebar container */}
          <RightSidebar />
        </div>
      </div>
    </motion.div>
  );
}
