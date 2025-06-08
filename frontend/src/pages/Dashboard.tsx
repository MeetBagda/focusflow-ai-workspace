/**
 * @fileoverview Dashboard component for displaying an overview of user tasks, notes, and focus sessions.
 * This component integrates with useTasks and useNotes hooks for data,
 * and provides quick access forms for adding tasks and notes.
 */

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckSquare, Clock, FileText } from "lucide-react";
import TaskItem from "@/components/tasks/TaskItem";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { QuickTaskForm } from "@/components/dashboard/QuickTaskForm";
import { QuickPomodoroTimer } from "@/components/dashboard/QuickPomodoroTimer";
import { QuickNoteForm } from "@/components/dashboard/QuickNoteForm";
import { TaskSuggestions } from "@/components/dashboard/TaskSuggestions";

// Import the useApi hooks from your centralized hooks directory
import { useTasks, useNotes } from "@/hooks/useApi";
import { Task, Note } from "@/types"; // Import types for clarity

interface DashboardProps {
  // These props are now handled internally by the useTasks and useNotes hooks
  // and are no longer passed from App.tsx directly.
  // The component will fetch its own data and manage its own state.
}

const Dashboard: React.FC<DashboardProps> = () => {
  // Use the hooks to get tasks and notes data and their respective CRUD operations
  const {
    tasks,
    tasksLoading,
    tasksError,
    updateTask,
    deleteTask,
    addTask, // Need addTask for QuickTaskForm
  } = useTasks();

  const {
    notes,
    notesLoading,
    notesError,
    addNote, // Need addNote for QuickNoteForm
  } = useNotes();

  // Memoize today's date calculation to prevent re-calculation on every render
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []); // Only runs once

  // Memoize tasks due today to prevent re-filtering on every render
  const tasksToday = useMemo(() => {
    return (tasks || []).filter(task => {
      if (!task.dueDate) return false; // Use dueDate as per Task type
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate.getTime() === today.getTime();
    });
  }, [tasks, today]); // Re-filter only if 'tasks' or 'today' changes

  // Memoize uncompleted tasks to prevent re-filtering on every render
  const uncompletedTasks = useMemo(() => {
    return (tasks || []).filter(task => !task.completed);
  }, [tasks]); // Re-filter only if 'tasks' changes

  // Memoize the last updated date for notes
  const lastNoteUpdate = useMemo(() => {
    if ((notes || []).length === 0) return "No notes created yet";
    const lastUpdatedTime = Math.max(
      ...(notes || []).map(n => new Date(n.updated_at || n.created_at).getTime())
    );
    return `Last updated ${new Date(lastUpdatedTime).toLocaleDateString()}`;
  }, [notes]); // Re-calculate only if 'notes' changes

  // Memoize the current date string for display
  const currentFormattedDate = useMemo(() => {
    return new Date().toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, []); // Empty dependency array means it only runs once per render cycle

  // Handle adding a quick task
  const handleQuickAddTask = async (title: string, dueDate: Date | null) => {
    const taskData: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
      title,
      description: null,
      dueDate: dueDate?.toISOString() || null,
      priority: "high",
      is_recurring: false,
      completed: false,
      reminder: null,
      recurrence_pattern: null,
      project_id: null,
    };
    await addTask(taskData);
  };

  // Handle adding a quick note
  const handleQuickAddNote = async (title: string, content: string) => {
    const noteData: Omit<Note, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
      title,
      content,
      project_id: null,
    };
    await addNote(noteData);
  };

  // Show loading/error states
  if (tasksLoading || notesLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-120px)] text-muted-foreground">
        Loading dashboard data...
      </div>
    );
  }

  if (tasksError || notesError) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-120px)] text-red-500">
        Error loading data: {tasksError || notesError}
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4"> {/* Added padding for mobile */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground">
          {currentFormattedDate}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card border border-border shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Tasks Remaining</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uncompletedTasks.length}</div>
            <p className="text-xs text-muted-foreground">
              {(tasks || []).length > 0
                ? `${Math.round((uncompletedTasks.length / (tasks || []).length) * 100)}% of tasks remaining`
                : "No tasks created yet"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border shadow-md">
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

        <Card className="bg-card border border-border shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Notes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(notes || []).length}</div>
            <p className="text-xs text-muted-foreground">
              {lastNoteUpdate}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card className="col-span-1 bg-card border border-border shadow-md">
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
                      onToggleComplete={(id) => updateTask(id, { completed: !tasks?.find(t => t.id === id)?.completed })}
                      onDeleteTask={deleteTask}
                      // Pass projects if TaskItem needs them for badges, etc.
                      // projects={projects} // Assuming projects are not needed here or fetched separately if needed
                      showProjectBadge={true} // Always show project badge on dashboard
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <p>No tasks scheduled for today.</p>
                </div>
              )}

              {/* QuickTaskForm now uses handleQuickAddTask */}
              <QuickTaskForm onAddTask={handleQuickAddTask} />

              <div className="mt-4 text-center">
                <Button variant="outline" asChild>
                  <>
                  <Link to="/app/tasks">View All Tasks</Link> {''}
                  {/* Updated link to /app/tasks */}
                  </>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Add AI Task Suggestions component */}
          {/* Ensure TaskSuggestions component can handle tasks being null/undefined if loading */}
          <TaskSuggestions tasks={tasks || []} />
        </div>

        <div className="space-y-6">
          <Card className="bg-card border border-border shadow-md">
            <CardHeader className="pb-3">
              <CardTitle>Quick Focus</CardTitle>
            </CardHeader>
            <CardContent>
              <QuickPomodoroTimer />
            </CardContent>
          </Card>

          <Card className="bg-card border border-border shadow-md">
            <CardHeader className="pb-3">
              <CardTitle>Quick Note</CardTitle>
            </CardHeader>
            <CardContent>
              {/* QuickNoteForm now uses handleQuickAddNote */}
              <QuickNoteForm onAddNote={handleQuickAddNote} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
