
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckSquare, Clock, FileText, Plus } from "lucide-react";
import { Task } from "@/types/task";
import { Note } from "@/types/note";
import TaskItem from "@/components/tasks/TaskItem";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { QuickTaskForm } from "@/components/dashboard/QuickTaskForm";
import { QuickPomodoroTimer } from "@/components/dashboard/QuickPomodoroTimer";
import { QuickNoteForm } from "@/components/dashboard/QuickNoteForm";
import { TaskSuggestions } from "@/components/dashboard/TaskSuggestions";

interface DashboardProps {
  tasks: Task[];
  notes: Note[];
  onToggleTaskComplete: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  tasks,
  notes,
  onToggleTaskComplete,
  onDeleteTask,
}) => {
  // Get tasks due today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tasksToday = tasks.filter(task => {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate.getTime() === today.getTime();
  });

  // Get uncompleted tasks
  const uncompletedTasks = tasks.filter(task => !task.completed);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground">
          {new Date().toLocaleDateString(undefined, { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Tasks Remaining</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uncompletedTasks.length}</div>
            <p className="text-xs text-muted-foreground">
              {tasks.length > 0
                ? `${Math.round((uncompletedTasks.length / tasks.length) * 100)}% of tasks remaining`
                : "No tasks created yet"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Focus Sessions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Complete a focus session to track your productivity
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Notes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notes.length}</div>
            <p className="text-xs text-muted-foreground">
              {notes.length > 0
                ? `Last updated ${new Date(
                    Math.max(...notes.map(n => new Date(n.updatedAt || n.createdAt).getTime()))
                  ).toLocaleDateString()}`
                : "No notes created yet"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card className="col-span-1">
            <CardHeader className="pb-3">
              <CardTitle>Today's Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              {tasksToday.length > 0 ? (
                <div className="space-y-1">
                  {tasksToday.map(task => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggleComplete={onToggleTaskComplete}
                      onDelete={onDeleteTask}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <p>No tasks scheduled for today.</p>
                </div>
              )}
              
              <QuickTaskForm />
              
              <div className="mt-4 text-center">
                <Button variant="outline" asChild>
                  <Link to="/tasks">View All Tasks</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Add AI Task Suggestions component */}
          <TaskSuggestions tasks={tasks} />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Quick Focus</CardTitle>
            </CardHeader>
            <CardContent>
              <QuickPomodoroTimer />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Quick Note</CardTitle>
            </CardHeader>
            <CardContent>
              <QuickNoteForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
