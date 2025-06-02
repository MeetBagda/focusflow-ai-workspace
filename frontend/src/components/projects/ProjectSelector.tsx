/**
 * @fileoverview ProjectSelector component for selecting a project from a dropdown.
 * This component displays the currently selected project or "All Projects" and
 * allows users to switch between projects or trigger the "Add Project" form.
 */

import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Project } from "@/types"; // Import Project from the main types barrel file
import { ChevronDown, Folder, FolderPlus } from "lucide-react";

interface ProjectSelectorProps {
  projects: Project[]; // Array of projects to display
  currentProject: Project | null; // Currently selected project
  onSelectProject: (project: Project | null) => void; // Handler for selecting a project
  onAddProject: () => void; // Handler for opening the add project form
}

const ProjectSelector: React.FC<ProjectSelectorProps> = ({
  projects,
  currentProject,
  onSelectProject,
  onAddProject,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <div className="flex items-center">
            {currentProject ? (
              <>
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: currentProject.color || '#ccc' }} // Fallback color
                />
                {currentProject.name}
              </>
            ) : (
              <>
                <Folder className="mr-2 h-4 w-4" />
                All Projects
              </>
            )}
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Projects</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onSelectProject(null)}
          className={!currentProject ? "bg-accent" : ""}
        >
          <Folder className="mr-2 h-4 w-4" />
          All Projects
        </DropdownMenuItem>
        {projects.map((project) => (
          <DropdownMenuItem
            key={project.id}
            onClick={() => onSelectProject(project)}
            className={currentProject?.id === project.id ? "bg-accent" : ""}
          >
            <div
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: project.color || '#ccc' }} // Fallback color
            />
            {project.name}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onAddProject}>
          <FolderPlus className="mr-2 h-4 w-4" />
          Create New Project
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProjectSelector;
