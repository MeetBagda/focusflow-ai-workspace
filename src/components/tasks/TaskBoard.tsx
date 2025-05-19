
import React from "react";
import { Task } from "@/types/task";
import { Project } from "@/types/project";
import { format, isToday, isTomorrow, addDays, isAfter, isBefore, startOfDay } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TaskItem from "./TaskItem";
import { QuickTaskForm } from "../dashboard/QuickTaskForm";

interface TaskBoardProps {
  tasks: Task[];
  projects?: Project[];
  currentProject?: Project | null;
  onToggleComplete: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onAddTask?: (title: string, dueDate: Date | null, projectId?: string) => void;
  onUpdateTask?: (id: string, updates: Partial<Task>) => void;
  onDuplicateTask?: (task: Task) => void;
  onMoveTask?: (taskId: string, projectId: string) => void;
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
  // Get current date
  const today = startOfDay(new Date());
  const tomorrow = addDays(today, 1);
  const dayAfterTomorrow = addDays(today, 2);
  const twoDaysAfterTomorrow = addDays(today, 3);

  // Filter tasks by current project if selected
  const filteredTasks = currentProject 
    ? tasks.filter(task => task.projectId === currentProject.id)
    : tasks;

  // Group tasks by timeframe
  const overdueTasks = filteredTasks.filter(
    (task) => !task.completed && task.dueDate && isBefore(new Date(task.dueDate), today)
  );
  
  const todayTasks = filteredTasks.filter(
    (task) => task.dueDate && isToday(new Date(task.dueDate))
  );
  
  const tomorrowTasks = filteredTasks.filter(
    (task) => task.dueDate && isTomorrow(new Date(task.dueDate))
  );
  
  const upcomingTasks = filteredTasks.filter(
    (task) => 
      task.dueDate && 
      isAfter(new Date(task.dueDate), tomorrow) &&
      isBefore(new Date(task.dueDate), addDays(today, 7))
  );

  // Function to handle adding a task with a specific due date
  const handleAddTask = (title: string, columnDate: Date) => {
    if (onAddTask) {
      onAddTask(title, columnDate, currentProject?.id);
    }
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
        projects={projects}
        showProjectBadge={!currentProject}
        currentProject={currentProject}
      />
    ));
  };

  // Render a column with tasks and add task form
  const renderColumn = (title: string, taskList: Task[], date: Date, count: number) => (
    <Card className="flex-1 min-w-[250px] max-w-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base font-medium flex items-center gap-2">
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
        
        {/* Add task form */}
        <div className="mt-4">
          <QuickTaskForm 
            onAddTask={(title) => handleAddTask(title, date)}
            initialValue=""
          />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-wrap lg:flex-nowrap gap-4 overflow-x-auto pb-4">
      {renderColumn("Overdue", overdueTasks, today, overdueTasks.length)}
      {renderColumn("Today", todayTasks, today, todayTasks.length)}
      {renderColumn("Tomorrow", tomorrowTasks, tomorrow, tomorrowTasks.length)}
      {renderColumn("Upcoming", upcomingTasks, dayAfterTomorrow, upcomingTasks.length)}
    </div>
  );
};

export default TaskBoard;