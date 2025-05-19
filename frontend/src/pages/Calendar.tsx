
import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Task } from "@/types/task";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TaskBoard from "@/components/tasks/TaskBoard";
import { useNavigate } from "react-router-dom";

interface CalendarPageProps {
  tasks: Task[];
  onToggleComplete?: (id: string) => void;
  onDeleteTask?: (id: string) => void;
  onAddTask?: (title: string, dueDate: Date | null) => void;
}

const CalendarPage: React.FC<CalendarPageProps> = ({ 
  tasks,
  onToggleComplete = () => {},
  onDeleteTask = () => {},
  onAddTask
}) => {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [activeTab, setActiveTab] = useState<string>("board");
  const navigate = useNavigate();

  // Group tasks by date for easier lookup
  const tasksByDate: Record<string, Task[]> = {};
  
  tasks.forEach(task => {
    if (task.dueDate) {
      const dateKey = task.dueDate.split('T')[0]; // YYYY-MM-DD
      if (!tasksByDate[dateKey]) {
        tasksByDate[dateKey] = [];
      }
      tasksByDate[dateKey].push(task);
    }
  });

  // Filter tasks for the selected date
  const selectedDateStr = date?.toISOString().split('T')[0];
  const selectedDateTasks = selectedDateStr ? tasksByDate[selectedDateStr] || [] : [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold mb-6">Calendar</h1>

      <Tabs defaultValue="board" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="board">Board View</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="board" className="mt-6">
          <TaskBoard 
            tasks={tasks} 
            onToggleComplete={onToggleComplete}
            onDeleteTask={onDeleteTask}
            onAddTask={onAddTask}
          />
        </TabsContent>
        
        <TabsContent value="calendar" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Monthly View</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border"
                  modifiers={{
                    hasTasks: Object.keys(tasksByDate).map(dateKey => new Date(dateKey)),
                  }}
                  modifiersStyles={{
                    hasTasks: {
                      fontWeight: "bold",
                      backgroundColor: "hsl(var(--primary) / 0.2)",
                    }
                  }}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  {date ? (
                    <>Tasks for {date.toLocaleDateString()}</>
                  ) : (
                    <>Select a date</>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDateTasks.length > 0 ? (
                  <ul className="space-y-2">
                    {selectedDateTasks.map(task => (
                      <li key={task.id} className="flex items-start gap-2">
                        <div className={`h-4 w-4 mt-1 rounded-full ${task.completed ? 'bg-primary/70' : 'bg-primary'}`} />
                        <div className={task.completed ? 'line-through text-muted-foreground' : ''}>
                          {task.title}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <p>No tasks for this date.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CalendarPage;
