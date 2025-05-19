
import React, { useState } from "react";
import { Note } from "@/types/note";
import NoteList from "@/components/notes/NoteList";
import NoteEditor from "@/components/notes/NoteEditor";

interface NotesProps {
  notes: Note[];
  onSaveNote: (note: Partial<Note>) => void;
  onDeleteNote: (id: string) => void;
}

const Notes: React.FC<NotesProps> = ({ notes, onSaveNote, onDeleteNote }) => {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleSelectNote = (note: Note) => {
    setSelectedNote(note);
    setIsEditing(false);
  };

  const handleNewNote = () => {
    setSelectedNote(null);
    setIsEditing(true);
  };

  const handleSave = (note: Partial<Note>) => {
    onSaveNote(note);
    setIsEditing(false);
    if (!note.id) {
      // If it's a new note, we'll need to find it in the list after saving
      // This would normally be handled by the backend returning the new note
      setTimeout(() => {
        const newest = [...notes].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0];
        if (newest) setSelectedNote(newest);
      }, 100);
    } else {
      // Update the selected note with the edited one
      const updated = notes.find(n => n.id === note.id);
      if (updated) setSelectedNote(updated);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleDelete = () => {
    if (selectedNote) {
      onDeleteNote(selectedNote.id);
      setSelectedNote(null);
    }
  };

  return (
    <div className="flex h-[calc(100vh-120px)]">
      <div className="w-1/3 border-r p-4 overflow-hidden">
        <NoteList 
          notes={notes}
          selectedNoteId={selectedNote?.id || null}
          onSelectNote={handleSelectNote}
          onNewNote={handleNewNote}
        />
      </div>
      
      <div className="w-2/3 p-4 overflow-auto">
        {isEditing ? (
          <NoteEditor 
            note={selectedNote}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        ) : selectedNote ? (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">{selectedNote.title}</h2>
              <div className="space-x-2">
                <button 
                  onClick={handleEdit}
                  className="px-3 py-1 text-sm rounded hover:bg-accent transition-colors"
                >
                  Edit
                </button>
                <button 
                  onClick={handleDelete}
                  className="px-3 py-1 text-sm rounded hover:bg-destructive hover:text-destructive-foreground transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
            <div className="text-sm text-muted-foreground mb-6">
              Last updated: {new Date(selectedNote.updatedAt || selectedNote.createdAt).toLocaleString()}
            </div>
            <div className="whitespace-pre-wrap">
              {selectedNote.content}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              <p className="mb-4">Select a note or create a new one</p>
              <button 
                onClick={handleNewNote}
                className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
              >
                Create Note
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notes;
