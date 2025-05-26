import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ClerkProvider, SignedIn, SignedOut } from "@clerk/clerk-react";

import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Focus from "./pages/Focus";
import Notes from "./pages/Notes";
import Calendar from "./pages/Calendar";
import NotFound from "./pages/NotFound";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

import { useTasks, useProjects, useNotes } from "@/hooks/useApi";
import CustomLogin from "./pages/CustomLogin";
import CustomSignUp from "./pages/CustomSignUp";

// Get Clerk publishable key from environment variables
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Create a new QueryClient instance outside of any component
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      retry: 1
    }
  }
});

/**
 * AppContent component contains all the logic that relies on React Query hooks.
 * This component is rendered as a child of QueryClientProvider to ensure the context is available.
 */
const AppContent = () => {
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
    addNote: saveNote,
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
  }, [addTask, saveNote]);

  // Show a loading indicator while data is being fetched
  if (tasksLoading || projectsLoading || notesLoading) {
    return <div>Loading...</div>;
  }

  // Render the main application content once data is loaded
  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<CustomLogin />} />
          <Route path="/signup" element={<CustomSignUp />} />

          {/* Protected routes - only accessible when signed in */}
          <Route
            path="/app/*"
            element={
              <SignedIn>
                <AppLayout />
              </SignedIn>
            }
          >
            <Route
              index
              element={
                <Dashboard
                  tasks={tasks || []}
                  notes={notes || []}
                  projects={(projects || []).map(p => ({ id: String(p.id), name: p.name }))}
                  onToggleTaskComplete={(id) => updateTask({ 
                    id: Number(id), 
                    data: { completed: !tasks?.find(t => t.id === Number(id))?.completed } 
                  })}
                  onDeleteTask={(id) => deleteTask(Number(id))}
                />
              }
            />
            <Route
              path="tasks"
              element={
                <Tasks
                  tasks={tasks || []}
                  projects={projects || []}
                  onAddTask={addTask}
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
            <Route path="focus" element={<Focus />} />
            <Route
              path="notes"
              element={
                <Notes
                  notes={notes || []}
                  onSaveNote={saveNote}
                  onDeleteNote={(id) => deleteNote(Number(id))}
                />
              }
            />
            <Route
            path="calendar"
            element={
              <Calendar 
                tasks={tasks || []}
                projects={(projects || []).map(p => ({ id: String(p.id), name: p.name }))}
                onToggleComplete={(id) => updateTask({ 
                    id: Number(id), 
                    data: { completed: !tasks?.find(t => t.id === Number(id))?.completed } 
                  })}
                  onDeleteTask={(id) => deleteTask(Number(id))}
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
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Redirect from old routes to new app routes */}
          <Route path="/dashboard" element={<Navigate to="/app" replace />} />
          <Route path="/tasks" element={<Navigate to="/app/tasks" replace />} />
          <Route path="/focus" element={<Navigate to="/app/focus" replace />} />
          <Route path="/notes" element={<Navigate to="/app/notes" replace />} />
          <Route path="/calendar" element={<Navigate to="/app/calendar" replace />} />

          {/* Catch all for 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  );
};

const App = () => {
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      {/* Provide the QueryClient to the entire application */}
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </ClerkProvider>
  );
};

export default App;