// filepath: d:\VS CODE\SAAS\focusflow-ai-workspace\frontend\src\components\tasks\TaskList.tsx
import React from "react";
import TaskItem from "./TaskItem";
import { Task } from "@/types/task";
import { Project } from "@/types/project";

interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (id: number) => void;
  onDelete: (id: number) => void;
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
  onDelete,
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
          onDeleteTask={onDelete}
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