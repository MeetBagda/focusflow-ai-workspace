/**
 * @fileoverview TaskItem component for displaying a single task.
 * It includes a checkbox for completion, task title, optional project badge,
 * due date, and a delete button (visible on hover).
 */

import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Task, Project } from "@/types"; // Import Task and Project from the main types barrel file
import { Trash2 } from "lucide-react"; // Import Trash2 icon directly for clarity

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

          {/* Show project badge if needed and not the current project being filtered */}
          {taskProject && taskProject.id !== currentProject?.id && (
            <div className="flex items-center mt-1">
              <div
                className="w-2 h-2 rounded-full mr-1.5"
                style={{ backgroundColor: taskProject.color || '#ccc' }} // Fallback color
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
            {/* Format date only if due_date is a valid date string */}
            {new Date(task.due_date).toLocaleDateString()}
          </span>
        )}
        {/* The delete button using a custom SVG, replaced with Trash2 for consistency and clarity */}
        <div className="hidden md:block">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDeleteTask(task.id)}
            className="h-7 w-7 p-0 opacity-0 group-hover:opacity-70 hover:opacity-100"
          >
            <span className="sr-only">Delete task</span>
            <Trash2 className="h-4 w-4 opacity-70 hover:opacity-100" /> {/* Using Lucide icon */}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;
