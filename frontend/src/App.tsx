import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ClerkProvider, SignedIn, SignedOut } from "@clerk/clerk-react";

import AppLayout from "./components/layout/AppLayout"; // Assuming this path remains
import Dashboard from "./pages/Dashboard"; // Assuming this path remains
import Tasks from "./pages/Tasks"; // Assuming this path remains
import Focus from "./pages/Focus"; // Assuming this path remains
import Notes from "./pages/Notes"; // Assuming this path remains
import Calendar from "./pages/Calendar"; // Assuming this path remains
import NotFound from "./pages/NotFound"; // Assuming this path remains
import LandingPage from "./pages/LandingPage"; // Assuming this path remains
import CustomLogin from "./features/auth/CustomLogin"; // Updated path for CustomLogin
import CustomSignUp from "./features/auth/CustomSignUp"; // Updated path for CustomSignUp

import { useTasks, useProjects, useNotes } from "@/hooks/useApi"; // Import the updated useApi hooks
import { Task, Note, Project } from "@/types"; // Import types for clarity

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
  // Use the updated useApi hooks
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
    addNote, // Renamed from saveNote for consistency with useNotes hook
    updateNote,
    deleteNote
  } = useNotes();

  // useEffect hook to handle custom events for quick adding tasks and notes
  useEffect(() => {
    // Handler for adding a quick task
    const handleQuickAddTask = (event: Event) => {
      const { title, dueDate, projectId } = (event as CustomEvent).detail;
      // Normalize dueDate to start of the day before saving
      const normalizedDueDate = dueDate ? new Date(dueDate) : null;
      if (normalizedDueDate) {
        normalizedDueDate.setHours(0, 0, 0, 0);
      }

      // Call the addTask function from useTasks hook with correct type
      addTask({
        title,
        description: null,
        dueDate: normalizedDueDate?.toISOString() || null, // Use dueDate as per Task type
        priority: "high",
        is_recurring: false,
        completed: false,
        reminder: null,
        recurrence_pattern: null,
        project_id: projectId || null,
      });
    };

    // Handler for adding a quick note
    const handleQuickAddNote = (event: Event) => {
      const { title, content } = (event as CustomEvent).detail;
      // Call the addNote function from useNotes hook with correct type
      addNote({
        title,
        content,
        project_id: null,
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
  }, [addTask, addNote]); // Dependencies for useCallback

  // Show a loading indicator while data is being fetched
  if (tasksLoading || projectsLoading || notesLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-foreground">
        Loading...
      </div>
    );
  }

  // Render the main application content once data is loaded
  return (
    <div className="h-screen overflow-hidden"> {/* Ensures the main container does not scroll itself */}
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
                    projects={(projects || []).map(p => ({ id: p.id, name: p.name }))} // Ensure project ID is number
                    onToggleTaskComplete={(id) => updateTask(Number(id), { completed: !tasks?.find(t => t.id === Number(id))?.completed })}
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
                    onAddTask={(taskData) => addTask(taskData as Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>)}
                    onToggleComplete={(id) => updateTask(Number(id), { completed: !tasks?.find(t => t.id === Number(id))?.completed })}
                    onDeleteTask={(id) => deleteTask(Number(id))}
                    onUpdateTask={(id, updates) => updateTask(Number(id), updates as Partial<Task>)}
                    onDuplicateTask={(task) => duplicateTask(task)}
                    onAddProject={(projectData) => addProject(projectData as Omit<Project, 'id' | 'user_id' | 'created_at' | 'updated_at'>)}
                    onUpdateProject={(id, updates) => updateProject(Number(id), updates as Partial<Project>)}
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
                    onSaveNote={(noteData) => {
                      if (noteData.id) {
                        updateNote(Number(noteData.id), noteData as Partial<Note>);
                      } else {
                        addNote(noteData as Omit<Note, 'id' | 'user_id' | 'created_at' | 'updated_at'>);
                      }
                    }}
                    onDeleteNote={(id) => deleteNote(Number(id))}
                  />
                }
              />
              <Route
                path="calendar"
                element={
                  <Calendar
                    tasks={tasks || []}
                    projects={(projects || []).map(p => ({ id: p.id, name: p.name }))} // Ensure project ID is number
                    onToggleComplete={(id) => updateTask(Number(id), { completed: !tasks?.find(t => t.id === Number(id))?.completed })}
                    onDeleteTask={(id) => deleteTask(Number(id))}
                    onAddTask={(title, dueDate) => {
                      const normalizedDueDate = dueDate ? new Date(dueDate) : null;
                      if (normalizedDueDate) {
                        normalizedDueDate.setHours(0, 0, 0, 0);
                      }
                      addTask({
                        title,
                        description: null,
                        dueDate: normalizedDueDate?.toISOString() || null,
                        priority: "high",
                        is_recurring: false,
                        completed: false,
                        reminder: null,
                        recurrence_pattern: null,
                        project_id: null,
                      });
                    }}
                    onUpdateTask={(id, updates) => updateTask(Number(id), updates as Partial<Task>)}
                    onDuplicateTask={(task) => duplicateTask(task)}
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
    </div>
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
