/**
 * @fileoverview ProjectSidebar component for displaying a list of projects in a sidebar.
 * This component shows project names, colors, and task counts, allowing users to
 * filter tasks by project and create new projects.
 */

import React from "react";
import { Project } from "@/types"; // Import Project from the main types barrel file
import { Button } from "@/components/ui/button";
import { FolderPlus, Folder } from "lucide-react";
import { cn } from "@/lib/utils"; // Assuming 'cn' is a utility for class concatenation

// Extend Project to include taskCount for display in the sidebar
interface ProjectWithTaskCount extends Project {
  taskCount: number;
}

interface ProjectSidebarProps {
  projects: ProjectWithTaskCount[]; // Array of projects with their task counts
  currentProjectId: number | null; // ID of the currently selected project
  onSelectProject: (projectId: number | null) => void; // Handler for selecting a project
  onAddProject: () => void; // Handler for opening the add project form
}

const ProjectSidebar: React.FC<ProjectSidebarProps> = ({
  projects,
  currentProjectId,
  onSelectProject,
  onAddProject,
}) => {
  // Calculate total tasks across all projects for the "All Projects" count
  const totalTaskCount = projects.reduce((sum, p) => sum + p.taskCount, 0);

  return (
    <div className="space-y-2 py-2">
      <h3 className="px-4 text-sm font-medium text-muted-foreground">My Projects</h3>

      {/* Button for "All Projects" */}
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start gap-3 pl-4",
          !currentProjectId && "bg-accent" // Highlight if "All Projects" is selected
        )}
        onClick={() => onSelectProject(null)}
      >
        <Folder className="h-4 w-4" />
        <span>All Projects</span>
        <span className="ml-auto text-xs text-muted-foreground">
          {totalTaskCount}
        </span>
      </Button>

      {/* Map through projects to render individual project buttons */}
      {projects.map(project => (
        <Button
          key={project.id}
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 pl-4",
            currentProjectId === project.id && "bg-accent" // Highlight if this project is selected
          )}
          onClick={() => onSelectProject(project.id)}
        >
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: project.color || '#ccc' }} // Fallback color
          />
          <span>{project.name}</span>
          <span className="ml-auto text-xs text-muted-foreground">
            {project.taskCount}
          </span>
        </Button>
      ))}

      {/* Button to add a new project */}
      <Button
        variant="ghost"
        className="w-full justify-start pl-4 text-muted-foreground hover:text-foreground hover:bg-accent"
        onClick={onAddProject}
      >
        <FolderPlus className="mr-2 h-4 w-4" />
        Add Project
      </Button>
    </div>
  );
};

export default ProjectSidebar;
