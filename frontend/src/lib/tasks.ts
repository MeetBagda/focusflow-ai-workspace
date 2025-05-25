import { apiClient } from './client';
import { Task } from '@/types/task';

export const taskApi = {
  getTasks: () => apiClient.get<Task[]>('/tasks'),
  createTask: (task: Partial<Task>) => {
    console.log('Creating task with data:', task); // Debug log
    return apiClient.post<Task>('/tasks', {
      title: task.title,
      description: task.description || null,
      due_date: task.due_date || null,
      priority: task.priority || 'medium',
      project_id: task.project_id !== undefined ? 
        (task.project_id === 0 ? null : task.project_id) : null,
      is_recurring: task.is_recurring || false,
      completed: task.completed || false
    });
  },
  updateTask: (id: number, task: Partial<Task>) => apiClient.put<Task>(`/tasks/${id}`, task),
  deleteTask: (id: number) => apiClient.delete(`/tasks/${id}`)
};