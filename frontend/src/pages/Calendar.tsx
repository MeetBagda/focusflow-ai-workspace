import React, { useState, useMemo, useCallback } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Task } from "@/types/task";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TaskBoard from "@/components/tasks/TaskBoard";
import TaskItem from "@/components/tasks/TaskItem";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

interface CalendarPageProps {
  projects: { id: string; name: string }[];
  tasks: Task[];
  onToggleComplete?: (id: string) => void;
  onDeleteTask?: (id: string) => void;
  onAddTask?: (title: string, dueDate: Date | null) => void;
  onUpdateTask?: (id: string, updates: Partial<Task>) => void;
  onDuplicateTask?: (task: Task) => void;
}

// Helper function to format a Date object to 'YYYY-MM-DD' string locally
const getLocalDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const CalendarPage: React.FC<CalendarPageProps> = ({
  tasks,
  projects,
  onToggleComplete = () => {},
  onDeleteTask = () => {},
  onAddTask = () => {},
  onUpdateTask = () => {},
  onDuplicateTask = () => {},
}) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [activeTab, setActiveTab] = useState<string>("board");
  const navigate = useNavigate();

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const tomorrow = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + 1);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [today]);

  const endOfWeek = useMemo(() => {
    const d = new Date(today);
    const dayOfWeek = today.getDay();
    const daysUntilEndOfWeek = 6 - dayOfWeek;
    d.setDate(today.getDate() + daysUntilEndOfWeek);
    d.setHours(23, 59, 59, 999);
    return d;
  }, [today]);

  const tasksByDate = useMemo(() => {
    const grouped: Record<string, Task[]> = {};
    tasks.forEach(task => {
      if (task.dueDate) {
        // Assuming task.dueDate is 'YYYY-MM-DD' or a string new Date() can parse correctly for date part
        // For consistency, ensure task.dueDate is stored as YYYY-MM-DD string representing local date
        const dateObj = new Date(task.dueDate); // If task.dueDate is YYYY-MM-DD, it's parsed as UTC midnight
                                                // To get local date key if needed: getLocalDateString(dateObj) - but check usage
        const dateKey = new Date(task.dueDate).toISOString().split('T')[0]; // This key is UTC date string.
                                                                           // This is fine if consistently used.
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(task);
      }
    });
    return grouped;
  }, [tasks]);

  const overdueTasks = useMemo(() => {
    return tasks.filter(task => {
      if (!task.dueDate || task.completed) return false;
      const dueDate = new Date(task.dueDate); // Parses YYYY-MM-DD as UTC midnight
      dueDate.setHours(0, 0, 0, 0);          // Adjusts to local midnight
      return dueDate.getTime() < today.getTime();
    });
  }, [tasks, today]);

  const todayTasks = useMemo(() => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate.getTime() === today.getTime();
    });
  }, [tasks, today]);

  const tomorrowTasks = useMemo(() => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate.getTime() === tomorrow.getTime();
    });
  }, [tasks, tomorrow]);

  const upcomingTasks = useMemo(() => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate.getTime() > tomorrow.getTime() && dueDate.getTime() <= endOfWeek.getTime();
    });
  }, [tasks, tomorrow, endOfWeek]);

  const selectedDateTasks = useMemo(() => {
    // If 'date' is a local date, its ISOString().split('T')[0] might be the previous day in UTC.
    // For matching with tasksByDate (which uses UTC date keys), we need consistent keying.
    // If task.dueDate is YYYY-MM-DD (local), and tasksByDate uses UTC keys, this needs care.
    // For simplicity here, assuming date selection and task.dueDate storage allow this to work.
    // If tasks are stored with 'YYYY-MM-DD' representing local date, and tasksByDate key uses that string directly
    // (after new Date(localDateStr).toISOString().split('T')[0]), it should be fine.
    const selectedDateStr = date ? new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString().split('T')[0] : undefined;
    return selectedDateStr ? tasksByDate[selectedDateStr] || [] : [];
  }, [date, tasksByDate]);

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
                onToggleComplete={onToggleComplete}
                onDeleteTask={onDeleteTask}
                onUpdateTask={onUpdateTask}
                onDuplicateTask={onDuplicateTask}
                projects={projects}
                showProjectBadge={true}
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
                  // --- MODIFIED LINE ---
                  const localDateString = getLocalDateString(targetDate);
                  navigate(`/tasks?date=${localDateString}`);
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
  ), [onToggleComplete, onDeleteTask, onUpdateTask, onDuplicateTask, projects, navigate, toast]);


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
            onToggleComplete={onToggleComplete}
            onDeleteTask={onDeleteTask}
            onAddTask={onAddTask} // Note: onAddTask is passed but not directly used by this component's "Add Task" buttons
            projects={projects}
          />
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                      // Ensure keys for modifiers match how tasksByDate is keyed if dates are local vs UTC
                      hasTasks: Object.keys(tasksByDate).map(dateKey => {
                        // dateKey from tasksByDate is YYYY-MM-DD (UTC). Need to parse it correctly.
                        // new Date(dateKey) will interpret "YYYY-MM-DD" as UTC midnight.
                        // The Calendar component usually works with local dates.
                        const [year, month, day] = dateKey.split('-').map(Number);
                        return new Date(year, month - 1, day); // Create local date for modifier
                      }),
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
                          onToggleComplete={onToggleComplete}
                          onDeleteTask={onDeleteTask}
                          onUpdateTask={onUpdateTask}
                          onDuplicateTask={onDuplicateTask}
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
                            // --- MODIFIED LINE ---
                            const localDateString = getLocalDateString(date);
                            navigate(`/tasks?date=${localDateString}`);
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