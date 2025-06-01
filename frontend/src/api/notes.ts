/**
 * @fileoverview API service for interacting with note-related backend endpoints.
 * This file defines functions for fetching, creating, updating, and deleting notes,
 * ensuring all requests are authenticated using the useAuthenticatedFetch hook.
 */

import { useAuthenticatedFetch } from './client'; // Import the custom authenticated fetch hook
import { Note, PartialUpdate } from '@/types'; // Import Note and PartialUpdate types

/**
 * Custom hook to provide note API functions.
 * This hook must be called within a React component or another custom hook.
 * @returns An object containing functions for note CRUD operations.
 */
export function useNotesApi() {
  const authenticatedFetch = useAuthenticatedFetch(); // Get the authenticated fetch function

  // Fetch all notes for the authenticated user
  const getNotes = async (): Promise<Note[]> => {
    return authenticatedFetch<Note[]>('/notes');
  };

  // Create a new note for the authenticated user
  const createNote = async (noteData: Omit<Note, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Note> => {
    return authenticatedFetch<Note>('/notes', {
      method: 'POST',
      body: JSON.stringify(noteData),
    });
  };

  // Update an existing note for the authenticated user
  const updateNote = async (id: number, updates: PartialUpdate<Note>): Promise<Note> => {
    return authenticatedFetch<Note>(`/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  };

  // Delete a note for the authenticated user
  const deleteNote = async (id: number): Promise<void> => {
    return authenticatedFetch<void>(`/notes/${id}`, {
      method: 'DELETE',
    });
  };

  return {
    getNotes,
    createNote,
    updateNote,
    deleteNote,
  };
}
