import { useCallback } from 'react';
import { useAuthenticatedFetch } from './client';
import { Note, PartialUpdate } from '@/types';

export function useNotesApi() {
  const authenticatedFetch = useAuthenticatedFetch();

  const getNotes = useCallback(async (): Promise<Note[]> => {
    return authenticatedFetch<Note[]>('/notes');
  }, [authenticatedFetch]);

  const createNote = useCallback(async (noteData: Omit<Note, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Note> => {
    return authenticatedFetch<Note>('/notes', {
      method: 'POST',
      body: JSON.stringify(noteData),
    });
  }, [authenticatedFetch]);

  const updateNote = useCallback(async (id: number, updates: PartialUpdate<Note>): Promise<Note> => {
    return authenticatedFetch<Note>(`/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }, [authenticatedFetch]);

  const deleteNote = useCallback(async (id: number): Promise<void> => {
    return authenticatedFetch<void>(`/notes/${id}`, {
      method: 'DELETE',
    });
  }, [authenticatedFetch]);

  return {
    getNotes,
    createNote,
    updateNote,
    deleteNote,
  };
}
