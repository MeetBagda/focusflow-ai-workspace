import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Focus from "./pages/Focus";
import Notes from "./pages/Notes";
import Calendar from "./pages/Calendar";
import NotFound from "./pages/NotFound";

import { Task } from "./types/task";
import { Note } from "./types/note";
import { Project } from "./types/project";

// Generate a unique ID
const generateId = () => Math.random().toString(36).substring(2, 15);

const queryClient = new QueryClient();

const App = () => {
  // Load initial data from localStorage
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem("focusflow-tasks");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing tasks from localStorage:", e);
      }
    }
    return [];
  });

  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem("focusflow-notes");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing notes from localStorage:", e);
      }
    }
    return [];
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem("focusflow-projects");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing projects from localStorage:", e);
      }
    }
    return [];
  });

  // Save data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("focusflow-tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("focusflow-notes", JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem("focusflow-projects", JSON.stringify(projects));
  }, [projects]);

  // Task functions
  const addTask = (title: string, dueDate: Date | null, projectId?: string) => {
    const newTask: Task = {
      id: generateId(),
      title,
      completed: false,
      dueDate: dueDate ? dueDate.toISOString() : null,
      createdAt: new Date().toISOString(),
      priority: "high",
      isRecurring: false,
      projectId: projectId || null
    };
    setTasks([...tasks, newTask]);
  };

  const toggleTaskComplete = (id: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(tasks.map((task) =>
      task.id === id ? { ...task, ...updates } : task
    ));
  };

  const duplicateTask = (task: Task) => {
    const newTask = {
      ...task,
      id: generateId(),
      createdAt: new Date().toISOString(),
      title: `${task.title} (Copy)`
    };
    setTasks([...tasks, newTask]);
  };

  // Note functions
  const saveNote = (note: Partial<Note>) => {
    if (note.id) {
      // Updating existing note
      setNotes(
        notes.map((n) =>
          n.id === note.id ? { ...n, ...note, updatedAt: new Date().toISOString() } : n
        )
      );
    } else {
      // Creating new note
      const newNote: Note = {
        id: generateId(),
        title: note.title || "Untitled Note",
        content: note.content || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setNotes([...notes, newNote]);
    }
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter((note) => note.id !== id));
  };

  // Project functions
  const addProject = (project: Omit<Project, "id" | "createdAt">) => {
    const newProject: Project = {
      ...project,
      id: generateId(),
      createdAt: new Date().toISOString()
    };
    setProjects([...projects, newProject]);
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(projects.map((project) =>
      project.id === id ? { ...project, ...updates } : project
    ));
  };

  const deleteProject = (id: string) => {
    setProjects(projects.filter((project) => project.id !== id));
  };

  // Event listeners for quick actions
  useEffect(() => {
    const handleQuickAddTask = (event: Event) => {
      const { title, dueDate } = (event as CustomEvent).detail;
      addTask(title, dueDate);
    };
    
    const handleQuickAddNote = (event: Event) => {
      const { title, content } = (event as CustomEvent).detail;
      saveNote({ title, content });
    };
    
    document.addEventListener("app:addTask", handleQuickAddTask);
    document.addEventListener("app:addNote", handleQuickAddNote);
    
    return () => {
      document.removeEventListener("app:addTask", handleQuickAddTask);
      document.removeEventListener("app:addNote", handleQuickAddNote);
    };
  }, [tasks, notes]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AppLayout />}>
              <Route
                index
                element={
                  <Dashboard
                    tasks={tasks}
                    notes={notes}
                    onToggleTaskComplete={toggleTaskComplete}
                    onDeleteTask={deleteTask}
                  />
                }
              />
              <Route
                path="tasks"
                element={
                  <Tasks
                    tasks={tasks}
                    projects={projects}
                    onAddTask={addTask}
                    onToggleComplete={toggleTaskComplete}
                    onDeleteTask={deleteTask}
                    onUpdateTask={updateTask}
                    onDuplicateTask={duplicateTask}
                    onAddProject={addProject}
                    onUpdateProject={updateProject}
                    onDeleteProject={deleteProject}
                  />
                }
              />
              <Route path="focus" element={<Focus />} />
              <Route
                path="notes"
                element={
                  <Notes
                    notes={notes}
                    onSaveNote={saveNote}
                    onDeleteNote={deleteNote}
                  />
                }
              />
              <Route
                path="calendar"
                element={
                  <Calendar 
                    tasks={tasks} 
                    onToggleComplete={toggleTaskComplete}
                    onDeleteTask={deleteTask}
                    onAddTask={addTask}
                  />
                }
              />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
