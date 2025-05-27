import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar"; // Assuming Sidebar is in the same directory
import { cn } from "@/lib/utils"; // Assuming 'cn' is a utility for class concatenation

const AppLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-background overflow-hidden"> {/* Added overflow-hidden here */}
      {/* Sidebar component, passing collapsed state and setter */}
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

      {/* Main content area */}
      <main
        className={cn(
          "flex-1 p-6 transition-all duration-300 overflow-auto", // flex-1 makes it take remaining width
          
        )}
      >
        {/* Outlet renders the child routes */}
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
