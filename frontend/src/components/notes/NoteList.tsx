/**
 * @fileoverview NoteList component for displaying a list of notes.
 * This component handles the rendering of individual note items and
 * manages the selection of a note for editing/viewing.
 */

import React from 'react';
import { Note } from '@/types'; // Import the Note type
import { cn } from '@/lib/utils'; // Assuming 'cn' is a utility for class concatenation

interface NoteListProps {
  notes: Note[]; // Array of notes to display
  selectedNoteId: number | null; // ID of the currently selected note
  onSelectNote: (note: Note) => void; // Handler for when a note is selected
}

const NoteList: React.FC<NoteListProps> = ({ notes, selectedNoteId, onSelectNote }) => {
  return (
    <div className="space-y-2">
      {notes.length === 0 ? (
        <p className="text-muted-foreground text-center py-4">No notes to display.</p>
      ) : (
        notes.map((note) => (
          <div
            key={note.id}
            className={cn(
              "p-3 border border-border rounded-md cursor-pointer transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              selectedNoteId === note.id ? "bg-accent text-accent-foreground border-primary" : "bg-card"
            )}
            onClick={() => onSelectNote(note)}
          >
            <h3 className="font-semibold text-foreground text-lg truncate">{note.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{note.content || 'No content'}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(note.updated_at || note.created_at).toLocaleDateString()}
            </p>
          </div>
        ))
      )}
    </div>
  );
};

export default NoteList;
