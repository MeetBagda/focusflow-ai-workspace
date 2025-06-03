import { useCallback } from 'react';
import { useAuthenticatedFetch } from './client';
import { Task, PartialUpdate } from '@/types';

export function useTasksApi() {
  const authenticatedFetch = useAuthenticatedFetch();

  // Memoize all API functions
  const getTasks = useCallback(async (): Promise<Task[]> => {
    return authenticatedFetch<Task[]>('/tasks');
  }, [authenticatedFetch]);

  const createTask = useCallback(async (taskData: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Task> => {
    return authenticatedFetch<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }, [authenticatedFetch]);

  const updateTask = useCallback(async (id: number, updates: PartialUpdate<Task>): Promise<Task> => {
    return authenticatedFetch<Task>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }, [authenticatedFetch]);

  const deleteTask = useCallback(async (id: number): Promise<void> => {
    return authenticatedFetch<void>(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }, [authenticatedFetch]);

  const duplicateTask = useCallback(async (task: Task): Promise<Task> => {
    const { id, user_id, created_at, updated_at, ...newTaskData } = task;
    return createTask(newTaskData);
  }, [createTask]);

  return {
    getTasks,
    createTask,
    updateTask,
    deleteTask,
    duplicateTask,
  };
}
