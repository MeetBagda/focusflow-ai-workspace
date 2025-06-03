// frontend/src/hooks/useApi.ts
/**
 * @fileoverview Custom React hooks for fetching and managing application data (Tasks, Projects, Notes).
 * These hooks now utilize React Query for robust data fetching, caching, and state management,
 * leveraging the centralized API service functions from '@/api' for authenticated operations.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react'; // Needed to check auth status for fetching
import { toast } from '@/components/ui/use-toast'; // For displaying notifications

// Import the API service hooks (assuming they are now memoized and stable)
import { useTasksApi, useProjectsApi, useNotesApi } from '@/api';

// Import your defined types
import { Task, Project, Note } from '@/types';
import { useState } from 'react';

// Define query keys for React Query caching
// This helps React Query identify and manage cached data.
const queryKeys = {
  tasks: ['tasks'],
  projects: ['projects'],
  notes: ['notes'],
  // You might add specific keys if you fetch individual items or filtered lists:
  // task: (id: number) => ['tasks', id],
  // project: (id: number) => ['projects', id],
  // note: (id: number) => ['notes', id],
};


/**
 * Custom hook for managing tasks using React Query.
 * Provides functions for fetching, adding, updating, deleting, and duplicating tasks.
 */
export function useTasks() {
  const { isSignedIn } = useAuth();
  const queryClient = useQueryClient(); // Get the query client instance
  const showToast = toast; // Alias toast for consistent usage

  // Renamed API functions when destructuring to avoid clashes
  const {
    getTasks: getTasksApi,
    createTask: createTaskApi,
    updateTask: updateTaskApi,
    deleteTask: deleteTaskApi,
    duplicateTask: duplicateTaskApi,
  } = useTasksApi();

  const [tasks, setTasks] = useState<Task[]>([]); // Keep for now if needed for intermediate states or non-RQ management

  // useQuery for fetching tasks
  const {
    data: tasksData, // Renamed 'data' to 'tasksData' to avoid conflict with 'tasks' state, though you might just use data from RQ
    isLoading: tasksLoading,
    error: tasksError,
    refetch: refetchTasks,
  } = useQuery<Task[], Error>({
    queryKey: queryKeys.tasks,
    queryFn: getTasksApi, // Use the renamed API function
    enabled: isSignedIn,
    initialData: [],
    placeholderData: (previousData) => previousData,
    onError: (error) => {
      console.error("Failed to fetch tasks:", error);
      showToast({
        title: "Error",
        description: `Failed to load tasks: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    },
  });

  // useMutation for adding a task
  const addTaskMutation = useMutation<Task, Error, Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>>({
    mutationFn: createTaskApi, // Use the renamed API function
    onSuccess: (newTask) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
      showToast({
        title: "Success",
        description: `Task "${newTask.title}" added.`,
      });
    },
    onError: (error) => {
      console.error("Failed to add task:", error);
      showToast({
        title: "Error",
        description: `Failed to add task: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    },
  });

  // useMutation for updating a task
  const updateTaskMutation = useMutation<Task, Error, { id: number; updates: Partial<Task> }>({
    mutationFn: ({ id, updates }) => updateTaskApi(id, updates), // Use the renamed API function
    onSuccess: (updatedTask) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
      showToast({
        title: "Success",
        description: `Task "${updatedTask.title}" updated.`,
      });
    },
    onError: (error) => {
      console.error("Failed to update task:", error);
      showToast({
        title: "Error",
        description: `Failed to update task: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    },
  });

  // useMutation for deleting a task
  const deleteTaskMutation = useMutation<void, Error, number>({
    mutationFn: deleteTaskApi, // Use the renamed API function
    onSuccess: () => { // Removed 'data, id' as they are not needed when invalidating
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
      showToast({
        title: "Success",
        description: "Task deleted.",
      });
    },
    onError: (error) => {
      console.error("Failed to delete task:", error);
      showToast({
        title: "Error",
        description: `Failed to delete task: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    },
  });

  // useMutation for duplicating a task
  const duplicateTaskMutation = useMutation<Task, Error, Task>({
    mutationFn: duplicateTaskApi, // Use the renamed API function
    onSuccess: (duplicatedTask) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
      showToast({
        title: "Success",
        description: `Task "${duplicatedTask.title}" duplicated.`,
      });
    },
    onError: (error) => {
      console.error("Failed to duplicate task:", error);
      showToast({
        title: "Error",
        description: `Failed to duplicate task: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    },
  });

  // Expose simplified functions to the component using mutation triggers
  const addTask = (taskData: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => addTaskMutation.mutateAsync(taskData);
  const updateTask = (id: number, updates: Partial<Task>) => updateTaskMutation.mutateAsync({ id, updates });
  const deleteTask = (id: number) => deleteTaskMutation.mutateAsync(id);
  const duplicateTask = (task: Task) => duplicateTaskMutation.mutateAsync(task); // Renamed to avoid previous clash, now matches common use

  return {
    // Return data from React Query, not local state
    tasks: tasksData || [],
    tasksLoading,
    tasksError: tasksError?.message || null,
    addTask,
    updateTask,
    deleteTask,
    duplicateTask,
    refetchTasks,
  };
}


/**
 * Custom hook for managing projects using React Query.
 */
export function useProjects() {
  const { isSignedIn } = useAuth();
  const queryClient = useQueryClient();
  const showToast = toast;

  // Renamed API functions when destructuring to avoid clashes
  const {
    getProjects: getProjectsApi,
    createProject: createProjectApi,
    updateProject: updateProjectApi,
    deleteProject: deleteProjectApi,
  } = useProjectsApi();

  const [projects, setProjects] = useState<Project[]>([]); // Keep for now if needed

  const {
    data: projectsData,
    isLoading: projectsLoading,
    error: projectsError,
    refetch: refetchProjects,
  } = useQuery<Project[], Error>({
    queryKey: queryKeys.projects,
    queryFn: getProjectsApi, // Use the renamed API function
    enabled: isSignedIn,
    initialData: [],
    placeholderData: (previousData) => previousData,
    onError: (error) => {
      console.error("Failed to fetch projects:", error);
      showToast({
        title: "Error",
        description: `Failed to load projects: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    },
  });

  const addProjectMutation = useMutation<Project, Error, Omit<Project, 'id' | 'user_id' | 'created_at' | 'updated_at'>>({
    mutationFn: createProjectApi, // Use the renamed API function
    onSuccess: (newProject) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects });
      showToast({
        title: "Success",
        description: `Project "${newProject.name}" created.`,
      });
    },
    onError: (error) => {
      console.error("Failed to add project:", error);
      showToast({
        title: "Error",
        description: `Failed to add project: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    },
  });

  const updateProjectMutation = useMutation<Project, Error, { id: number; updates: Partial<Project> }>({
    mutationFn: ({ id, updates }) => updateProjectApi(id, updates), // Use the renamed API function
    onSuccess: (updatedProject) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects });
      showToast({
        title: "Success",
        description: `Project "${updatedProject.name}" updated.`,
      });
    },
    onError: (error) => {
      console.error("Failed to update project:", error);
      showToast({
        title: "Error",
        description: `Failed to update project: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    },
  });

  const deleteProjectMutation = useMutation<void, Error, number>({
    mutationFn: deleteProjectApi, // Use the renamed API function
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects });
      showToast({
        title: "Success",
        description: "Project deleted.",
      });
    },
    onError: (error) => {
      console.error("Failed to delete project:", error);
      showToast({
        title: "Error",
        description: `Failed to delete project: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    },
  });

  const addProject = (projectData: Omit<Project, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => addProjectMutation.mutateAsync(projectData);
  const updateProject = (id: number, updates: Partial<Project>) => updateProjectMutation.mutateAsync({ id, updates });
  const deleteProject = (id: number) => deleteProjectMutation.mutateAsync(id);

  return {
    projects: projectsData || [],
    projectsLoading,
    projectsError: projectsError?.message || null,
    addProject,
    updateProject,
    deleteProject,
    refetchProjects,
  };
}


/**
 * Custom hook for managing notes using React Query.
 */
export function useNotes() {
  const { isSignedIn } = useAuth();
  const queryClient = useQueryClient();
  const showToast = toast;

  // Renamed API functions when destructuring to avoid clashes
  const {
    getNotes: getNotesApi,
    createNote: createNoteApi,
    updateNote: updateNoteApi,
    deleteNote: deleteNoteApi,
  } = useNotesApi();

  const [notes, setNotes] = useState<Note[]>([]); // Keep for now if needed

  const {
    data: notesData,
    isLoading: notesLoading,
    error: notesError,
    refetch: refetchNotes,
  } = useQuery<Note[], Error>({
    queryKey: queryKeys.notes,
    queryFn: getNotesApi, // Use the renamed API function
    enabled: isSignedIn,
    initialData: [],
    placeholderData: (previousData) => previousData,
    onError: (error) => {
      console.error("Failed to fetch notes:", error);
      showToast({
        title: "Error",
        description: `Failed to load notes: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    },
  });

  const addNoteMutation = useMutation<Note, Error, Omit<Note, 'id' | 'user_id' | 'created_at' | 'updated_at'>>({
    mutationFn: createNoteApi, // Use the renamed API function
    onSuccess: (newNote) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notes });
      showToast({
        title: "Success",
        description: `Note "${newNote.title}" created.`,
      });
    },
    onError: (error) => {
      console.error("Failed to add note:", error);
      showToast({
        title: "Error",
        description: `Failed to add note: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    },
  });

  const updateNoteMutation = useMutation<Note, Error, { id: number; updates: Partial<Note> }>({
    mutationFn: ({ id, updates }) => updateNoteApi(id, updates), // Use the renamed API function
    onSuccess: (updatedNote) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notes });
      showToast({
        title: "Success",
        description: `Note "${updatedNote.title}" updated.`,
      });
    },
    onError: (error) => {
      console.error("Failed to update note:", error);
      showToast({
        title: "Error",
        description: `Failed to update note: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    },
  });

  const deleteNoteMutation = useMutation<void, Error, number>({
    mutationFn: deleteNoteApi, // Use the renamed API function
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notes });
      showToast({
        title: "Success",
        description: "Note deleted.",
      });
    },
    onError: (error) => {
      console.error("Failed to delete note:", error);
      showToast({
        title: "Error",
        description: `Failed to delete note: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    },
  });

  const addNote = (noteData: Omit<Note, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => addNoteMutation.mutateAsync(noteData);
  const updateNote = (id: number, updates: Partial<Note>) => updateNoteMutation.mutateAsync({ id, updates });
  const deleteNote = (id: number) => deleteNoteMutation.mutateAsync(id);

  return {
    notes: notesData || [],
    notesLoading,
    notesError: notesError?.message || null,
    addNote,
    updateNote,
    deleteNote,
    refetchNotes,
  };
}