
import React from "react";
import { ProjectWithTaskCount } from "@/types/project";
import { Button } from "@/components/ui/button";
import { FolderPlus, Folder } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProjectSidebarProps {
  projects: ProjectWithTaskCount[];
  currentProjectId: string | null;
  onSelectProject: (projectId: string | null) => void;
  onAddProject: () => void;
}

const ProjectSidebar: React.FC<ProjectSidebarProps> = ({
  projects,
  currentProjectId,
  onSelectProject,
  onAddProject,
}) => {
  return (
    <div className="space-y-2 py-2">
      <h3 className="px-4 text-sm font-medium text-muted-foreground">My Projects</h3>
      
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start gap-3 pl-4",
          !currentProjectId && "bg-accent"
        )}
        onClick={() => onSelectProject(null)}
      >
        <Folder className="h-4 w-4" />
        <span>All Projects</span>
        <span className="ml-auto text-xs text-muted-foreground">
          {projects.reduce((sum, p) => sum + p.taskCount, 0)}
        </span>
      </Button>
      
      {projects.map(project => (
        <Button
          key={project.id}
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 pl-4",
            currentProjectId === project.id && "bg-accent"
          )}
          onClick={() => onSelectProject(project.id)}
        >
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: project.color }} 
          />
          <span>{project.name}</span>
          <span className="ml-auto text-xs text-muted-foreground">
            {project.taskCount}
          </span>
        </Button>
      ))}
      
      <Button
        variant="ghost"
        className="w-full justify-start pl-4 text-muted-foreground"
        onClick={onAddProject}
      >
        <FolderPlus className="mr-2 h-4 w-4" />
        Add Project
      </Button>
    </div>
  );
};

export default ProjectSidebar;