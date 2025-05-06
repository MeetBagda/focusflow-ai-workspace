
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddTaskForm from "@/components/tasks/AddTaskForm";
import TaskList from "@/components/tasks/TaskList";
import { Task } from "@/types/task";

interface TasksProps {
  tasks: Task[];
  onAddTask: (title: string, dueDate: Date | null) => void;
  onToggleComplete: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

const Tasks: React.FC<TasksProps> = ({
  tasks,
  onAddTask,
  onToggleComplete,
  onDeleteTask,
}) => {
  const [activeTab, setActiveTab] = useState<string>("all");

  // Get today's date (without time)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get tomorrow's date
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Get end of current week
  const endOfWeek = new Date(today);
  const dayOfWeek = today.getDay();
  const daysUntilEndOfWeek = 6 - dayOfWeek;
  endOfWeek.setDate(today.getDate() + daysUntilEndOfWeek);

  // Filter tasks based on active tab
  const filteredTasks = tasks.filter((task) => {
    if (activeTab === "all") return true;
    if (activeTab === "completed") return task.completed;
    if (activeTab === "uncompleted") return !task.completed;

    if (!task.dueDate) return activeTab === "no-date";

    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);

    if (activeTab === "today") return dueDate.getTime() === today.getTime();
    if (activeTab === "tomorrow") return dueDate.getTime() === tomorrow.getTime();
    if (activeTab === "this-week") {
      return dueDate > today && dueDate <= endOfWeek;
    }
    return false;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold mb-6">Tasks</h1>
        <AddTaskForm onAddTask={onAddTask} />
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 md:grid-cols-7 mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="tomorrow">Tomorrow</TabsTrigger>
          <TabsTrigger value="this-week">This Week</TabsTrigger>
          <TabsTrigger value="no-date">No Date</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="uncompleted">Uncompleted</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <TaskList
            tasks={filteredTasks}
            onToggleComplete={onToggleComplete}
            onDelete={onDeleteTask}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Tasks;
