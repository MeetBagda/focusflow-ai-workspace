import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Task } from "@/types/task";
import { Project } from "@/types/project";

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: number) => void;
  onDeleteTask: (id: number) => void;
  onUpdateTask?: (id: number, updates: Partial<Task>) => void;
  onDuplicateTask?: (task: Task) => void;
  onMoveTask?: (taskId: number, projectId: number) => void;
  projects?: Project[];
  showProjectBadge?: boolean;
  currentProject?: Project | null;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggleComplete,
  onDeleteTask,
  onUpdateTask,
  onDuplicateTask,
  onMoveTask,
  projects = [],
  showProjectBadge = false,
  currentProject = null,
}) => {
  // Find the project this task belongs to
  const taskProject = showProjectBadge && task.project_id 
    ? projects.find(p => p.id === task.project_id) 
    : null;

  return (
    <div className="flex items-center justify-between py-2 px-3 hover:bg-accent/30 rounded-md transition-colors group">
      <div className="flex items-center gap-3">
        <Checkbox 
          id={`task-${task.id}`}
          checked={task.completed}
          onCheckedChange={() => onToggleComplete(task.id)}
        />
        <div>
          <label 
            htmlFor={`task-${task.id}`}
            className={cn(
              "cursor-pointer",
              task.completed && "line-through text-muted-foreground"
            )}
          >
            {task.title}
          </label>
          
          {/* Show project badge if needed */}
          {taskProject && taskProject.id !== currentProject?.id && (
            <div className="flex items-center mt-1">
              <div 
                className="w-2 h-2 rounded-full mr-1.5" 
                style={{ backgroundColor: taskProject.color }} 
              />
              <span className="text-xs text-muted-foreground">
                {taskProject.name}
              </span>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {task.due_date && (
          <span className="text-xs text-muted-foreground">
            {new Date(task.due_date).toLocaleDateString()}
          </span>
        )}
        <div className="hidden md:block">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onDeleteTask(task.id)}
            className="h-7 w-7 p-0 opacity-0 group-hover:opacity-70 hover:opacity-100"
          >
            <span className="sr-only">Delete task</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-70 hover:opacity-100"
            >
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;