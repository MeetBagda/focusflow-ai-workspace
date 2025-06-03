import { useCallback } from 'react';
import { useAuthenticatedFetch } from './client';
import { Project, PartialUpdate } from '@/types';

export function useProjectsApi() {
  const authenticatedFetch = useAuthenticatedFetch();

  const getProjects = useCallback(async (): Promise<Project[]> => {
    return authenticatedFetch<Project[]>('/projects');
  }, [authenticatedFetch]);

  const createProject = useCallback(async (projectData: Omit<Project, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Project> => {
    return authenticatedFetch<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }, [authenticatedFetch]);

  const updateProject = useCallback(async (id: number, updates: PartialUpdate<Project>): Promise<Project> => {
    return authenticatedFetch<Project>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }, [authenticatedFetch]);

  const deleteProject = useCallback(async (id: number): Promise<void> => {
    return authenticatedFetch<void>(`/projects/${id}`, {
      method: 'DELETE',
    });
  }, [authenticatedFetch]);

  return {
    getProjects,
    createProject,
    updateProject,
    deleteProject,
  };
}
