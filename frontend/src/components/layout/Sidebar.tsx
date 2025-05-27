import React from "react";
import { NavLink } from "react-router-dom";
import { Home, CheckSquare, Clock, FileText, Calendar } from "lucide-react"; // Grouped imports
import { cn } from "@/lib/utils"; // Assuming 'cn' is a utility for class concatenation
import ThemeToggle from "./ThemeToggle";
import { Button } from "@/components/ui/button"; // Assuming this is a custom Button component
import { UserButton } from "@clerk/clerk-react";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

// Define navItems outside the component to prevent re-creation on every render.
// This is a micro-optimization for static data.
const navItems = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Focus", href: "/focus", icon: Clock },
  { name: "Notes", href: "/notes", icon: FileText },
  { name: "Calendar", href: "/calendar", icon: Calendar },
];

const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  return (
    <aside
      className={cn(
        "h-screen bg-sidebar border-r border-border transition-all duration-300 flex flex-col overflow-hidden",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="p-4 flex items-center justify-between">
        {/* Only render the text if the sidebar is not collapsed */}
        {!collapsed && (
          <div className="font-semibold text-xl">
            Focus<span className="text-primary">Flow</span>
          </div>
        )}
        {/* Button to toggle sidebar collapse state */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(collapsed && "mx-auto")} // Center button when collapsed
        >
          {/* SVG icon for the collapse/expand button */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn(
              "transition-transform",
              collapsed ? "rotate-180" : "rotate-0" // Rotate icon based on collapsed state
            )}
          >
            <path d="M14 7l-5 5 5 5" />
          </svg>
        </Button>
      </div>

      <nav className="flex-1 px-2 py-4">
        <ul className="space-y-2">
          {/* Map through navItems to render navigation links */}
          {navItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    "flex items-center px-3 py-2 rounded-md hover:bg-accent transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground" // Active link styles
                      : "text-foreground", // Inactive link styles
                    collapsed ? "justify-center" : "justify-start" // Alignment based on collapsed state
                  )
                }
                // Add a title for accessibility when collapsed
                title={collapsed ? item.name : undefined}
              >
                {/* Render the icon component */}
                <item.icon className="h-5 w-5" />
                {/* Only render the text if the sidebar is not collapsed */}
                {!collapsed && <span className="ml-3">{item.name}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* User and Theme Toggle section */}
      <div
        className={cn(
          "p-4 border-t border-border flex items-center justify-center",
          collapsed ? "flex-col gap-4" : "flex-row gap-7" // Layout based on collapsed state
        )}
      >
        <UserButton /> {/* Clerk's UserButton component */}
        <ThemeToggle /> {/* Custom ThemeToggle component */}
      </div>
    </aside>
  );
};

export default Sidebar;
