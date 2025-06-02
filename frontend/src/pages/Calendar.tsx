/**
 * @fileoverview Calendar page component for displaying and managing user tasks in a calendar or board view.
 * This component integrates with useTasks and useProjects hooks for data,
 * and provides various ways to visualize and interact with tasks based on their due dates.
 */

import React, { useState, useMemo, useCallback } from "react";
import { Calendar } from "@/components/ui/calendar"; // Assuming custom calendar component
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Task, Project } from "@/types"; // Import Task and Project from the main types barrel file
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TaskBoard from "@/components/tasks/TaskBoard"; // Existing TaskBoard
import TaskItem from "@/components/tasks/TaskItem"; // To display tasks
import { Button } from "@/components/ui/button"; // For Add Task button
import { Plus } from "lucide-react"; // Plus icon
import { useNavigate } from "react-router-dom"; // For navigation
import { toast } from "@/components/ui/use-toast"; // For toasts

// Import the useApi hooks from your centralized hooks directory
import { useTasks, useProjects } from "@/hooks/useApi";

interface CalendarPageProps {
  // These props are now handled internally by the useTasks and useProjects hooks
  // and are no longer passed from App.tsx directly.
  // The component will fetch its own data and manage its own state.
}

const CalendarPage: React.FC<CalendarPageProps> = () => {
  // Use the hooks to get tasks and projects data and their respective CRUD operations
  const {
    tasks,
    tasksLoading,
    tasksError,
    addTask,
    updateTask,
    deleteTask,
    duplicateTask,
    refetchTasks // Added refetch for manual refresh if needed
  } = useTasks();

  const {
    projects,
    projectsLoading,
    projectsError,
    refetchProjects // Added refetch for manual refresh if needed
  } = useProjects();

  const [date, setDate] = useState<Date | undefined>(new Date());
  const [activeTab, setActiveTab] = useState<string>("board"); // Default to board view
  const navigate = useNavigate();

  // Show loading/error states
  if (tasksLoading || projectsLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-120px)] text-muted-foreground">
        Loading calendar data...
      </div>
    );
  }

  if (tasksError || projectsError) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-120px)] text-red-500">
        Error loading data: {tasksError || projectsError}
      </div>
    );
  }

  // Memoize today's date for consistent comparisons
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Memoize tomorrow's date
  const tomorrow = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + 1);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [today]);

  // Memoize the end of the current week (Saturday)
  const endOfWeek = useMemo(() => {
    const d = new Date(today);
    const dayOfWeek = today.getDay(); // 0 for Sunday, 6 for Saturday
    const daysUntilEndOfWeek = 6 - dayOfWeek;
    d.setDate(today.getDate() + daysUntilEndOfWeek);
    d.setHours(23, 59, 59, 999); // Set to end of the day
    return d;
  }, [today]);

  // Memoize and group tasks by date for calendar markers and lookup
  const tasksByDate = useMemo(() => {
    const grouped: Record<string, Task[]> = {};
    tasks.forEach(task => {
      if (task.due_date) { // Use due_date as per Task type
        // Ensure task.due_date is consistently normalized to YYYY-MM-DD
        // at the point of task creation/saving (e.g., in AddTaskForm).
        const dateKey = new Date(task.due_date).toISOString().split('T')[0]; // YYYY-MM-DD
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(task);
      }
    });
    return grouped;
  }, [tasks]);

  // Memoize filtered tasks for specific categories
  const overdueTasks = useMemo(() => {
    return tasks.filter(task => {
      if (!task.due_date || task.completed) return false;
      const dueDate = new Date(task.due_date);
      dueDate.setHours(0, 0, 0, 0); // Normalize for comparison
      return dueDate.getTime() < today.getTime();
    });
  }, [tasks, today]);

  const todayTasks = useMemo(() => {
    return tasks.filter(task => {
      if (!task.due_date) return false;
      const dueDate = new Date(task.due_date);
      dueDate.setHours(0, 0, 0, 0); // Normalize for comparison
      return dueDate.getTime() === today.getTime();
    });
  }, [tasks, today]);

  const tomorrowTasks = useMemo(() => {
    return tasks.filter(task => {
      if (!task.due_date) return false;
      const dueDate = new Date(task.due_date);
      dueDate.setHours(0, 0, 0, 0); // Normalize for comparison
      return dueDate.getTime() === tomorrow.getTime();
    });
  }, [tasks, tomorrow]);

  const upcomingTasks = useMemo(() => {
    return tasks.filter(task => {
      if (!task.due_date) return false;
      const dueDate = new Date(task.due_date);
      dueDate.setHours(0, 0, 0, 0); // Normalize for comparison
      // Upcoming tasks are due after tomorrow and within the current week (inclusive of endOfWeek)
      return dueDate.getTime() > tomorrow.getTime() && dueDate.getTime() <= endOfWeek.getTime();
    });
  }, [tasks, tomorrow, endOfWeek]);

  // Memoize tasks for the currently selected date
  const selectedDateTasks = useMemo(() => {
    const selectedDateStr = date?.toISOString().split('T')[0];
    return selectedDateStr ? tasksByDate[selectedDateStr] || [] : [];
  }, [date, tasksByDate]);

  // Helper component to render a list of tasks
  const RenderTaskList = useCallback(({ taskList, title, emptyMessage, showAddButton = false, targetDate = null }: { taskList: Task[], title: string, emptyMessage: string, showAddButton?: boolean, targetDate?: Date | null }) => (
    <Card className="bg-card border border-border shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-foreground">{title} ({taskList.length})</CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        {taskList.length > 0 ? (
          <ul className="space-y-2">
            {taskList.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onToggleComplete={(id) => updateTask(id, { completed: !tasks?.find(t => t.id === id)?.completed })}
                onDeleteTask={deleteTask}
                onUpdateTask={updateTask}
                onDuplicateTask={duplicateTask}
                projects={projects} // Pass projects for move functionality if TaskItem supports it
                showProjectBadge={true} // Always show project badge in calendar view
              />
            ))}
          </ul>
        ) : (
          <div className="text-center py-4 text-muted-foreground text-sm">
            <p>{emptyMessage}</p>
            {showAddButton && targetDate && (
              <Button
                variant="outline"
                size="sm"
                className="mt-3 text-primary hover:bg-primary/10"
                onClick={() => {
                  // Navigating to /tasks page to add a task with the target date pre-filled.
                  // Ensure that the AddTaskForm or the task creation logic on the /tasks page
                  // correctly parses this 'date' query parameter and normalizes the dueDate
                  // to the start of the day (00:00:00) before saving the task.
                  navigate(`/app/tasks?date=${targetDate.toISOString().split('T')[0]}`); // Updated path to /app/tasks
                  toast({
                    title: "Add Task",
                    description: `Navigating to add task for ${targetDate.toLocaleDateString()}.`,
                  });
                }}
              >
                <Plus className="h-4 w-4 mr-1" /> Add Task
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  ), [tasks, projects, updateTask, deleteTask, duplicateTask, navigate, toast]);


  // Handler for adding a task (used by TaskBoard)
  const handleAddTask = useCallback(async (taskData: Partial<Task>) => {
    try {
      await addTask(taskData as Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>);
      toast({
        title: "Task added",
        description: `Task '${taskData.title}' has been added.`,
      });
    } catch (error: any) {
      console.error("Error adding task:", error);
      toast({
        title: "Error",
        description: `Failed to add task: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    }
  }, [addTask, toast]);


  return (
    <div className="space-y-6 p-4 md:p-6 bg-background rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-foreground mb-6">Calendar</h1>

      <Tabs defaultValue="board" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-auto">
          <TabsTrigger value="board">Board View</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>

        <TabsContent value="board" className="mt-6">
          <TaskBoard
            tasks={tasks}
            onToggleComplete={(id) => updateTask(id, { completed: !tasks?.find(t => t.id === id)?.completed })}
            onDeleteTask={deleteTask}
            onAddTask={handleAddTask} // Use the new handleAddTask
            onUpdateTask={updateTask}
            onDuplicateTask={duplicateTask}
            projects={projects}
          />
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Calendar and Selected Date Tasks */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-card border border-border shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold text-foreground">Monthly View</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center pt-2">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border border-border bg-card-secondary text-foreground w-full"
                    modifiers={{
                      hasTasks: Object.keys(tasksByDate).map(dateKey => new Date(dateKey)),
                    }}
                    modifiersStyles={{
                      hasTasks: {
                        fontWeight: "bold",
                        backgroundColor: "hsl(var(--primary) / 0.2)",
                        color: "hsl(var(--primary-foreground))",
                        borderRadius: "0.375rem",
                      }
                    }}
                  />
                </CardContent>
              </Card>

              <Card className="bg-card border border-border shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold text-foreground">
                    {date ? (
                      <>Tasks for {date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</>
                    ) : (
                      <>Select a date to see tasks</>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  {selectedDateTasks.length > 0 ? (
                    <ul className="space-y-2">
                      {selectedDateTasks.map(task => (
                        <TaskItem
                          key={task.id}
                          task={task}
                          onToggleComplete={(id) => updateTask(id, { completed: !tasks?.find(t => t.id === id)?.completed })}
                          onDeleteTask={deleteTask}
                          onUpdateTask={updateTask}
                          onDuplicateTask={duplicateTask}
                          projects={projects}
                          showProjectBadge={true}
                        />
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                      <p>No tasks scheduled for {date ? date.toLocaleDateString() : 'the selected date'}.</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3 text-primary hover:bg-primary/10"
                        onClick={() => {
                          if (date) {
                            navigate(`/app/tasks?date=${date.toISOString().split('T')[0]}`); // Updated path to /app/tasks
                            toast({
                              title: "Add Task",
                              description: `Navigating to add task for ${date.toLocaleDateString()}.`,
                            });
                          }
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add Task for this Date
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Overdue, Today, Tomorrow, Upcoming Tasks */}
            <div className="lg:col-span-1 space-y-6">
              <RenderTaskList
                taskList={overdueTasks}
                title="Overdue"
                emptyMessage="No overdue tasks! Great job."
              />
              <RenderTaskList
                taskList={todayTasks}
                title="Today"
                emptyMessage="No tasks scheduled for today."
                showAddButton={true}
                targetDate={today}
              />
              <RenderTaskList
                taskList={tomorrowTasks}
                title="Tomorrow"
                emptyMessage="No tasks scheduled for tomorrow."
                showAddButton={true}
                targetDate={tomorrow}
              />
              <RenderTaskList
                taskList={upcomingTasks}
                title="Upcoming"
                emptyMessage="No upcoming tasks this week."
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CalendarPage;
