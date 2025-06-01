/**
 * @fileoverview Custom React hooks for fetching and managing application data (Tasks, Projects, Notes).
 * These hooks now utilize the centralized API service functions from '@/api', ensuring
 * authenticated and user-isolated data operations.
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react'; // Needed to check auth status for fetching
import { toast } from '@/components/ui/use-toast'; // For displaying notifications

// Import the new API service hooks
import { useTasksApi, useProjectsApi, useNotesApi } from '@/api';

// Import your defined types
import { Task, Project, Note } from '@/types';

/**
 * Custom hook for managing tasks.
 * Provides functions for fetching, adding, updating, deleting, and duplicating tasks.
 */
export function useTasks() {
  const { isSignedIn } = useAuth(); // Check if user is signed in
  const { getTasks, createTask, updateTask, deleteTask, duplicateTask } = useTasksApi(); // Get API functions
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksError, setTasksError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!isSignedIn) {
      setTasksLoading(false);
      setTasks([]);
      return;
    }
    setTasksLoading(true);
    setTasksError(null);
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (error: any) {
      console.error("Failed to fetch tasks:", error);
      setTasksError(error.message || "Failed to fetch tasks.");
      toast({
        title: "Error",
        description: `Failed to load tasks: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setTasksLoading(false);
    }
  }, [isSignedIn, getTasks, toast]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = useCallback(async (taskData: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const newTask = await createTask(taskData);
      setTasks(prevTasks => [...prevTasks, newTask]);
      toast({
        title: "Success",
        description: `Task "${newTask.title}" added.`,
      });
      return newTask;
    } catch (error: any) {
      console.error("Failed to add task:", error);
      setTasksError(error.message || "Failed to add task.");
      toast({
        title: "Error",
        description: `Failed to add task: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
      throw error; // Re-throw to allow component to handle
    }
  }, [createTask, toast]);

  const updateTaskById = useCallback(async (id: number, updates: Partial<Task>) => {
    try {
      const updatedTask = await updateTask(id, updates);
      setTasks(prevTasks => prevTasks.map(task =>
        task.id === updatedTask.id ? updatedTask : task
      ));
      toast({
        title: "Success",
        description: `Task "${updatedTask.title}" updated.`,
      });
      return updatedTask;
    } catch (error: any) {
      console.error("Failed to update task:", error);
      setTasksError(error.message || "Failed to update task.");
      toast({
        title: "Error",
        description: `Failed to update task: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
      throw error;
    }
  }, [updateTask, toast]);

  const deleteTaskById = useCallback(async (id: number) => {
    try {
      await deleteTask(id);
      setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
      toast({
        title: "Success",
        description: "Task deleted.",
      });
    } catch (error: any) {
      console.error("Failed to delete task:", error);
      setTasksError(error.message || "Failed to delete task.");
      toast({
        title: "Error",
        description: `Failed to delete task: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
      throw error;
    }
  }, [deleteTask, toast]);

  const duplicateTaskById = useCallback(async (task: Task) => {
    try {
      const duplicated = await duplicateTask(task);
      setTasks(prevTasks => [...prevTasks, duplicated]);
      toast({
        title: "Success",
        description: `Task "${duplicated.title}" duplicated.`,
      });
      return duplicated;
    } catch (error: any) {
      console.error("Failed to duplicate task:", error);
      setTasksError(error.message || "Failed to duplicate task.");
      toast({
        title: "Error",
        description: `Failed to duplicate task: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
      throw error;
    }
  }, [duplicateTask, toast]);

  return {
    tasks,
    tasksLoading,
    tasksError,
    addTask,
    updateTask: updateTaskById, // Renamed to avoid conflict with imported updateTask
    deleteTask: deleteTaskById, // Renamed to avoid conflict with imported deleteTask
    duplicateTask: duplicateTaskById, // Renamed to avoid conflict with imported duplicateTask
    refetchTasks: fetchTasks, // Provide a way to manually refetch
  };
}

/**
 * Custom hook for managing projects.
 * Provides functions for fetching, adding, updating, and deleting projects.
 */
export function useProjects() {
  const { isSignedIn } = useAuth();
  const { getProjects, createProject, updateProject, deleteProject } = useProjectsApi();
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    if (!isSignedIn) {
      setProjectsLoading(false);
      setProjects([]);
      return;
    }
    setProjectsLoading(true);
    setProjectsError(null);
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (error: any) {
      console.error("Failed to fetch projects:", error);
      setProjectsError(error.message || "Failed to fetch projects.");
      toast({
        title: "Error",
        description: `Failed to load projects: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setProjectsLoading(false);
    }
  }, [isSignedIn, getProjects, toast]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const addProject = useCallback(async (projectData: Omit<Project, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const newProject = await createProject(projectData);
      setProjects(prevProjects => [...prevProjects, newProject]);
      toast({
        title: "Success",
        description: `Project "${newProject.name}" created.`,
      });
      return newProject;
    } catch (error: any) {
      console.error("Failed to add project:", error);
      setProjectsError(error.message || "Failed to add project.");
      toast({
        title: "Error",
        description: `Failed to add project: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
      throw error;
    }
  }, [createProject, toast]);

  const updateProjectById = useCallback(async (id: number, updates: Partial<Project>) => {
    try {
      const updatedProject = await updateProject(id, updates);
      setProjects(prevProjects => prevProjects.map(project =>
        project.id === updatedProject.id ? updatedProject : project
      ));
      toast({
        title: "Success",
        description: `Project "${updatedProject.name}" updated.`,
      });
      return updatedProject;
    } catch (error: any) {
      console.error("Failed to update project:", error);
      setProjectsError(error.message || "Failed to update project.");
      toast({
        title: "Error",
        description: `Failed to update project: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
      throw error;
    }
  }, [updateProject, toast]);

  const deleteProjectById = useCallback(async (id: number) => {
    try {
      await deleteProject(id);
      setProjects(prevProjects => prevProjects.filter(project => project.id !== id));
      toast({
        title: "Success",
        description: "Project deleted.",
      });
    } catch (error: any) {
      console.error("Failed to delete project:", error);
      setProjectsError(error.message || "Failed to delete project.");
      toast({
        title: "Error",
        description: `Failed to delete project: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
      throw error;
    }
  }, [deleteProject, toast]);

  return {
    projects,
    projectsLoading,
    projectsError,
    addProject,
    updateProject: updateProjectById,
    deleteProject: deleteProjectById,
    refetchProjects: fetchProjects,
  };
}

/**
 * Custom hook for managing notes.
 * Provides functions for fetching, adding, updating, and deleting notes.
 */
export function useNotes() {
  const { isSignedIn } = useAuth();
  const { getNotes, createNote, updateNote, deleteNote } = useNotesApi();
  const [notes, setNotes] = useState<Note[]>([]);
  const [notesLoading, setNotesLoading] = useState(true);
  const [notesError, setNotesError] = useState<string | null>(null);

  const fetchNotes = useCallback(async () => {
    if (!isSignedIn) {
      setNotesLoading(false);
      setNotes([]);
      return;
    }
    setNotesLoading(true);
    setNotesError(null);
    try {
      const data = await getNotes();
      setNotes(data);
    } catch (error: any) {
      console.error("Failed to fetch notes:", error);
      setNotesError(error.message || "Failed to fetch notes.");
      toast({
        title: "Error",
        description: `Failed to load notes: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setNotesLoading(false);
    }
  }, [isSignedIn, getNotes, toast]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const addNote = useCallback(async (noteData: Omit<Note, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const newNote = await createNote(noteData);
      setNotes(prevNotes => [...prevNotes, newNote]);
      toast({
        title: "Success",
        description: `Note "${newNote.title}" created.`,
      });
      return newNote;
    } catch (error: any) {
      console.error("Failed to add note:", error);
      setNotesError(error.message || "Failed to add note.");
      toast({
        title: "Error",
        description: `Failed to add note: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
      throw error;
    }
  }, [createNote, toast]);

  const updateNoteById = useCallback(async (id: number, updates: Partial<Note>) => {
    try {
      const updatedNote = await updateNote(id, updates);
      setNotes(prevNotes => prevNotes.map(note =>
        note.id === updatedNote.id ? updatedNote : note
      ));
      toast({
        title: "Success",
        description: `Note "${updatedNote.title}" updated.`,
      });
      return updatedNote;
    } catch (error: any) {
      console.error("Failed to update note:", error);
      setNotesError(error.message || "Failed to update note.");
      toast({
        title: "Error",
        description: `Failed to update note: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
      throw error;
    }
  }, [updateNote, toast]);

  const deleteNoteById = useCallback(async (id: number) => {
    try {
      await deleteNote(id);
      setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
      toast({
        title: "Success",
        description: "Note deleted.",
      });
    } catch (error: any) {
      console.error("Failed to delete note:", error);
      setNotesError(error.message || "Failed to delete note.");
      toast({
        title: "Error",
        description: `Failed to delete note: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
      throw error;
    }
  }, [deleteNote, toast]);

  return {
    notes,
    notesLoading,
    notesError,
    addNote,
    updateNote: updateNoteById,
    deleteNote: deleteNoteById,
    refetchNotes: fetchNotes,
  };
}
