
import React from "react";
import { NavLink } from "react-router-dom";
import { Calendar, CheckSquare, Clock, FileText, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import ThemeToggle from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/clerk-react";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const navItems = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Tasks", href: "/tasks", icon: CheckSquare },
    { name: "Focus", href: "/focus", icon: Clock },
    { name: "Notes", href: "/notes", icon: FileText },
    { name: "Calendar", href: "/calendar", icon: Calendar },
  ];

  return (
    <aside
      className={cn(
        "h-screen bg-sidebar border-r border-border transition-all duration-300 flex flex-col overflow-hidden",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="p-4 flex items-center justify-between">
        {!collapsed && (
          <div className="font-semibold text-xl">
            Focus<span className="text-primary">Flow</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(collapsed && "mx-auto")}
        >
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
              collapsed ? "rotate-180" : "rotate-0"
            )}
          >
            <path d="M14 7l-5 5 5 5" />
          </svg>
        </Button>
      </div>

      <nav className="flex-1 px-2 py-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    "flex items-center px-3 py-2 rounded-md hover:bg-accent transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground",
                    collapsed ? "justify-center" : "justify-start"
                  )
                }
              >
                <item.icon className="h-5 w-5" />
                {!collapsed && <span className="ml-3">{item.name}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

       <div
        className={cn(
          "p-4 border-t border-border flex items-center justify-center",
          collapsed ? "flex-col gap-4" : "flex-row gap-7"
        )}
      >
        <UserButton />
        <ThemeToggle />
      </div>
    </aside>
  );
};

export default Sidebar;
