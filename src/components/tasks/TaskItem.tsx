
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Task } from "@/types/task";

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggleComplete,
  onDelete,
}) => {
  return (
    <div className="flex items-center justify-between py-2 px-3 hover:bg-accent/30 rounded-md transition-colors">
      <div className="flex items-center gap-3">
        <Checkbox 
          id={`task-${task.id}`}
          checked={task.completed}
          onCheckedChange={() => onToggleComplete(task.id)}
        />
        <label 
          htmlFor={`task-${task.id}`}
          className={cn(
            "cursor-pointer",
            task.completed && "line-through text-muted-foreground"
          )}
        >
          {task.title}
        </label>
      </div>
      
      <div className="flex items-center gap-2">
        {task.dueDate && (
          <span className="text-xs text-muted-foreground">
            {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onDelete(task.id)}
          className="h-7 w-7 p-0"
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
  );
};

export default TaskItem;
