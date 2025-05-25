import { apiClient } from './client';
import { Note } from '@/types/note';

export const noteApi = {
  getNotes: () => apiClient.get<Note[]>('/notes'),
  createNote: (note: Note) => apiClient.post<Note>('/notes', note),
  updateNote: (id: number, note: Note) => apiClient.put<Note>(`/notes/${id}`, note),
  deleteNote: (id: number) => apiClient.delete(`/notes/${id}`)
};