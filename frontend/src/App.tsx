import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Focus from "./pages/Focus";
import Notes from "./pages/Notes";
import Calendar from "./pages/Calendar";
import NotFound from "./pages/NotFound";

import { useTasks, useProjects, useNotes } from "@/hooks/useApi";

// Create a new QueryClient instance outside of any component
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Do not refetch queries when the window regains focus
      staleTime: 5 * 60 * 1000, // Data is considered stale after 5 minutes
      retry: 1 // Retry failed queries once
    }
  }
});

/**
 * AppContent component contains all the logic that relies on React Query hooks.
 * This component is rendered as a child of QueryClientProvider to ensure the context is available.
 */
const AppContent = () => {
  // Destructure hooks for tasks, projects, and notes from useApi
  const { 
    tasks, 
    tasksLoading,
    addTask,
    updateTask,
    deleteTask,
    duplicateTask 
  } = useTasks();

  const {
    projects,
    projectsLoading,
    addProject,
    updateProject,
    deleteProject
  } = useProjects();

  const {
    notes,
    notesLoading,
    addNote: saveNote, // Renamed addNote to saveNote to avoid naming conflicts
    updateNote,
    deleteNote
  } = useNotes();

  // useEffect hook to handle custom events for quick adding tasks and notes
  useEffect(() => {
    // Handler for adding a quick task
    const handleQuickAddTask = (event: Event) => {
      const { title, dueDate, projectId } = (event as CustomEvent).detail;
      addTask({
        title,
        due_date: dueDate?.toISOString(),
        project_id: projectId || null,
        completed: false,
        priority: "high",
        is_recurring: false,
        description: null,
        id: 0,
        reminder: "",
        recurrence_pattern: "",
        created_at: "",
        updated_at: ""
      });
    };
    
    // Handler for adding a quick note
    const handleQuickAddNote = (event: Event) => {
      const { title, content } = (event as CustomEvent).detail;
      saveNote({
        title,
        content,
        project_id: null,
        id: 0,
        created_at: "",
        updated_at: ""
      });
    };
    
    // Add event listeners for custom app events
    document.addEventListener("app:addTask", handleQuickAddTask);
    document.addEventListener("app:addNote", handleQuickAddNote);
    
    // Cleanup function to remove event listeners when the component unmounts
    return () => {
      document.removeEventListener("app:addTask", handleQuickAddTask);
      document.removeEventListener("app:addNote", handleQuickAddNote);
    };
  }, [addTask, saveNote]); // Dependencies for the useEffect hook

  // Show a loading indicator while data is being fetched
  if (tasksLoading || projectsLoading || notesLoading) {
    return <div>Loading...</div>;
  }

  // Render the main application content once data is loaded
  return (
    <TooltipProvider>
      <Toaster /> {/* Toast notifications */}
      <Sonner /> {/* Sonner notifications */}
      <BrowserRouter> {/* React Router for navigation */}
        <Routes>
          <Route path="/" element={<AppLayout />}> {/* Main layout for the app */}
            <Route
              index // Default route for the AppLayout
              element={
                <Dashboard
                  tasks={tasks || []}
                  notes={notes || []}
                  // Map project IDs to strings as required by the Dashboard component
                  projects={(projects || []).map(p => ({ id: String(p.id), name: p.name }))}
                  // Callback for toggling task completion status
                  onToggleTaskComplete={(id) => updateTask({ 
                    id: Number(id), 
                    data: { completed: !tasks?.find(t => t.id === Number(id))?.completed } 
                  })}
                  onDeleteTask={(id) => deleteTask(Number(id))}
                />
              }
            />
            <Route
              path="tasks" // Route for the tasks page
              element={
                <Tasks
                  tasks={tasks || []}
                  projects={projects || []}
                  // Callback for adding a new task
                  onAddTask={(title, dueDate, projectId) => addTask({
                    title,
                    due_date: dueDate?.toISOString() || null,
                    project_id: projectId ? Number(projectId) : null,
                    completed: false,
                    priority: "high",
                    is_recurring: false,
                    id: 0,
                    description: "",
                    reminder: "",
                    recurrence_pattern: "",
                    created_at: "",
                    updated_at: ""
                  })}
                  // Callback for toggling task completion
                  onToggleComplete={(id) => updateTask({ 
                    id: Number(id), 
                    data: { completed: !tasks?.find(t => t.id === Number(id))?.completed } 
                  })}
                  onDeleteTask={(id) => deleteTask(Number(id))}
                  onUpdateTask={(id, updates) => updateTask({ id: Number(id), data: updates })}
                  onDuplicateTask={duplicateTask}
                  onAddProject={addProject}
                  onUpdateProject={(id, updates) => updateProject({ id: Number(id), data: updates })}
                  onDeleteProject={(id) => deleteProject(Number(id))}
                />
              }
            />
            <Route path="focus" element={<Focus />} /> {/* Route for the focus page */}
              <Route
              path="notes" // Route for the notes page
              element={
                <Notes
                  notes={notes || []}
                  onSaveNote={saveNote}
                  onDeleteNote={(id) => deleteNote(Number(id))}
                />
              }
            />
            <Route
            path="calendar" // Route for the calendar page
            element={
              <Calendar 
                tasks={tasks || []}
                // Map project IDs to strings for the Calendar component
                projects={(projects || []).map(p => ({ id: String(p.id), name: p.name }))}
                // Callback for toggling task completion in calendar
                onToggleComplete={(id) => updateTask({ 
                    id: Number(id), 
                    data: { completed: !tasks?.find(t => t.id === Number(id))?.completed } 
                  })}
                  onDeleteTask={(id) => deleteTask(Number(id))}
                  // Callback for adding a new task from the calendar
                  onAddTask={(title, dueDate) => addTask({
                    title,
                    due_date: dueDate?.toISOString() || null,
                    project_id: null,
                    completed: false,
                    priority: "high",
                    is_recurring: false,
                    id: 0,
                    description: "",
                    reminder: "",
                    recurrence_pattern: "",
                    created_at: "",
                    updated_at: ""
                  })}
              />
            }
            />
            <Route path="*" element={<NotFound />} /> {/* Catch-all route for 404 */}
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  );
};

const App = () => {
  return (
    // Provide the QueryClient to the entire application
    <QueryClientProvider client={queryClient}>
      <AppContent /> {/* Render the actual application content */}
    </QueryClientProvider>
  );
};

export default App;
