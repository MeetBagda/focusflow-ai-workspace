/**
 * @fileoverview TaskBoard component for displaying tasks grouped by timeframe.
 * This component filters, groups, and renders tasks, and provides an interface
 * for adding new tasks to specific timeframes.
 */

import React from "react";
import { Task, Project } from "@/types"; // Import Task and Project from the main types barrel file
import { format, isToday, isTomorrow, addDays, isAfter, isBefore, startOfDay } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TaskItem from "./TaskItem";
// Assuming QuickTaskForm is correctly imported and located, often in a shared or dashboard context
import { QuickTaskForm } from "@/components/dashboard/QuickTaskForm"; // Updated path based on typical structure

interface TaskBoardProps {
  tasks: Task[];
  projects?: Project[]; // Optional projects array for displaying project badges
  currentProject?: Project | null; // Optional current project for filtering
  onToggleComplete: (id: number) => void;
  onDeleteTask: (id: number) => void;
  onAddTask: (task: Partial<Task>) => void; // Expects a partial task to allow flexible creation
  onUpdateTask?: (id: number, updates: Partial<Task>) => void;
  onDuplicateTask?: (task: Task) => void;
  onMoveTask?: (taskId: number, projectId: number) => void;
}

const TaskBoard: React.FC<TaskBoardProps> = ({
  tasks,
  projects = [],
  currentProject = null,
  onToggleComplete,
  onDeleteTask,
  onAddTask,
  onUpdateTask,
  onDuplicateTask,
  onMoveTask,
}) => {
  // Get current date for filtering logic
  const today = startOfDay(new Date());
  const tomorrow = addDays(today, 1);
  const dayAfterTomorrow = addDays(today, 2); // This was previously used for 'Upcoming', keeping it for context
  const oneWeekFromNow = addDays(today, 7); // Define the end range for "Upcoming"

  // Filter tasks by current project if selected
  const filteredTasks = currentProject
    ? tasks.filter(task => task.project_id === currentProject.id)
    : tasks;

  // Group tasks by timeframe
  const overdueTasks = filteredTasks.filter(
    (task) => !task.completed && task.due_date && isBefore(new Date(task.due_date), today)
  );

  const todayTasks = filteredTasks.filter(
    (task) => task.due_date && isToday(new Date(task.due_date))
  );

  const tomorrowTasks = filteredTasks.filter(
    (task) => task.due_date && isTomorrow(new Date(task.due_date))
  );

  const upcomingTasks = filteredTasks.filter(
    (task) =>
      task.due_date &&
      isAfter(new Date(task.due_date), tomorrow) && // After tomorrow
      isBefore(new Date(task.due_date), oneWeekFromNow) // Within the next 7 days
  );
  
  // Tasks without a due date, or tasks with a due date far in the future
  const noDueDateTasks = filteredTasks.filter(
    (task) => !task.due_date || isAfter(new Date(task.due_date), oneWeekFromNow)
  );


  // Function to handle adding a task with a specific due date
  // This will be called by QuickTaskForm
  const handleAddTaskForColumn = (title: string, dueDate: Date | null = null) => {
    // onAddTask expects a Partial<Task>
    onAddTask({
      title,
      due_date: dueDate ? dueDate.toISOString() : null, // Convert Date to ISO string
      project_id: currentProject?.id || null,
      completed: false,
      priority: "medium", // Default priority, can be customized
      is_recurring: false,
      description: null,
    });
  };

  // Function to render the task list for a column
  const renderTaskList = (taskList: Task[]) => {
    if (taskList.length === 0) {
      return (
        <div className="text-center text-muted-foreground text-sm py-4">
          No tasks
        </div>
      );
    }

    return taskList.map((task) => (
      <TaskItem
        key={task.id}
        task={task}
        onToggleComplete={onToggleComplete}
        onDeleteTask={onDeleteTask}
        onUpdateTask={onUpdateTask}
        onDuplicateTask={onDuplicateTask}
        onMoveTask={onMoveTask}
        projects={projects}
        showProjectBadge={!currentProject} // Only show project badge if not viewing a specific project
        currentProject={currentProject}
      />
    ));
  };

  // Render a column with tasks and add task form
  const renderColumn = (title: string, taskList: Task[], defaultDueDate: Date | null, count: number) => (
    <Card className="flex-1 min-w-[280px] max-w-sm bg-card-secondary border border-border shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            {title}
            {count > 0 && (
              <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                {count}
              </span>
            )}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="space-y-1">
          {renderTaskList(taskList)}
        </div>

        {/* Add task form for this column */}
        <div className="mt-4">
          <QuickTaskForm
            onAddTask={(title) => handleAddTaskForColumn(title, defaultDueDate)}
            initialValue=""
          />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-wrap lg:flex-nowrap gap-4 overflow-x-auto pb-4 px-4 sm:px-0">
      {renderColumn("Overdue", overdueTasks, today, overdueTasks.length)}
      {renderColumn("Today", todayTasks, today, todayTasks.length)}
      {renderColumn("Tomorrow", tomorrowTasks, tomorrow, tomorrowTasks.length)}
      {renderColumn("Upcoming (Next 7 Days)", upcomingTasks, dayAfterTomorrow, upcomingTasks.length)}
      {renderColumn("No Due Date / Later", noDueDateTasks, null, noDueDateTasks.length)}
    </div>
  );
};

export default TaskBoard;
