import { apiClient } from './client';
import { Project } from '@/types/project';

export const projectApi = {
  getProjects: () => apiClient.get<Project[]>('/projects'),
  createProject: (project: Project) => apiClient.post<Project>('/projects', project),
  updateProject: (id: number, project: Project) => apiClient.put<Project>(`/projects/${id}`, project),
  deleteProject: (id: number) => apiClient.delete(`/projects/${id}`)
};