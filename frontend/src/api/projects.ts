/**
 * @fileoverview API service for interacting with project-related backend endpoints.
 * This file defines functions for fetching, creating, updating, and deleting projects,
 * ensuring all requests are authenticated using the useAuthenticatedFetch hook.
 */

import { useAuthenticatedFetch } from './client'; // Import the custom authenticated fetch hook
import { Project, PartialUpdate } from '@/types'; // Import Project and PartialUpdate types

/**
 * Custom hook to provide project API functions.
 * This hook must be called within a React component or another custom hook.
 * @returns An object containing functions for project CRUD operations.
 */
export function useProjectsApi() {
  const authenticatedFetch = useAuthenticatedFetch(); // Get the authenticated fetch function

  // Fetch all projects for the authenticated user
  const getProjects = async (): Promise<Project[]> => {
    return authenticatedFetch<Project[]>('/projects');
  };

  // Create a new project for the authenticated user
  const createProject = async (projectData: Omit<Project, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Project> => {
    return authenticatedFetch<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  };

  // Update an existing project for the authenticated user
  const updateProject = async (id: number, updates: PartialUpdate<Project>): Promise<Project> => {
    return authenticatedFetch<Project>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  };

  // Delete a project for the authenticated user
  const deleteProject = async (id: number): Promise<void> => {
    return authenticatedFetch<void>(`/projects/${id}`, {
      method: 'DELETE',
    });
  };

  return {
    getProjects,
    createProject,
    updateProject,
    deleteProject,
  };
}
