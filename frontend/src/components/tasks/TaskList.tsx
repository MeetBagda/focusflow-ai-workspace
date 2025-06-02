/**
 * @fileoverview TaskList component for rendering a collection of TaskItem components.
 * It serves as a container for displaying lists of tasks.
 */

import React from "react";
import TaskItem from "./TaskItem";
import { Task, Project } from "@/types"; // Import Task and Project from the main types barrel file

interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (id: number) => void;
  onDelete: (id: number) => void; // Renamed from onDeleteTask to onDelete for consistency with the prop name
  onUpdateTask?: (id: number, updates: Partial<Task>) => void;
  onDuplicateTask?: (task: Task) => void;
  onMoveTask?: (taskId: number, projectId: number) => void;
  projects?: Project[];
  showProjectBadge?: boolean;
  currentProject?: Project | null;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onToggleComplete,
  onDelete, // Use the renamed prop here
  onUpdateTask,
  onDuplicateTask,
  onMoveTask,
  projects = [],
  showProjectBadge = false,
  currentProject = null,
}) => {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No tasks yet. Add one to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggleComplete={onToggleComplete}
          onDeleteTask={onDelete} // Pass onDelete to onDeleteTask prop of TaskItem
          onUpdateTask={onUpdateTask}
          onDuplicateTask={onDuplicateTask}
          onMoveTask={onMoveTask}
          projects={projects}
          showProjectBadge={showProjectBadge}
          currentProject={currentProject}
        />
      ))}
    </div>
  );
};

export default TaskList;
