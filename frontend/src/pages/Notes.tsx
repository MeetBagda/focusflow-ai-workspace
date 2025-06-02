/**
 * @fileoverview Notes page component for displaying and managing user notes.
 * This component orchestrates the NoteList and NoteEditor components,
 * and interacts with the useNotes hook for data management.
 */

import React, { useState, useMemo, useCallback } from "react";
import { Note } from "@/types"; // Import the Note type
import NoteList from "@/components/notes/NoteList";
import NoteEditor from "@/components/notes/NoteEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Edit, Trash2 } from "lucide-react"; // Removed X as it's not used in this component's JSX
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast"; // Assuming useToast hook

interface NotesProps {
  notes: Note[]; // Notes fetched from useNotes hook
  onSaveNote: (note: Omit<Note, 'user_id' | 'created_at' | 'updated_at'> | Note) => void; // Function to add/update note
  onDeleteNote: (id: number) => void; // Function to delete note
}

const Notes: React.FC<NotesProps> = ({ notes, onSaveNote, onDeleteNote }) => {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Memoize filtered notes based on search term
  const filteredNotes = useMemo(() => {
    if (!searchTerm) {
      return notes;
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return notes.filter(note =>
      note.title.toLowerCase().includes(lowerCaseSearchTerm) ||
      (note.content && note.content.toLowerCase().includes(lowerCaseSearchTerm))
    );
  }, [notes, searchTerm]);

  // Sort notes by last updated/created date, newest first
  const sortedNotes = useMemo(() => {
    return [...filteredNotes].sort((a, b) =>
      new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime()
    );
  }, [filteredNotes]);

  const handleSelectNote = useCallback((note: Note) => {
    setSelectedNote(note);
    setIsEditing(false); // Switch to view mode when a note is selected
  }, []);

  const handleNewNote = useCallback(() => {
    setSelectedNote(null); // Clear any selected note
    setIsEditing(true); // Enter editing mode for a new note
  }, []);

  const handleSave = useCallback((noteData: Omit<Note, 'user_id' | 'created_at' | 'updated_at'> | Note) => {
    onSaveNote(noteData); // Pass the data to the parent handler (App.tsx -> useNotes)
    setIsEditing(false); // Exit editing mode after saving

    // After saving, attempt to select the newly created/updated note
    // This relies on the parent's `notes` state being updated by the API hook.
    // A more robust solution might involve the `onSaveNote` prop returning the new note.
    if (!noteData.id) { // If it was a new note being created
      // Give a small delay for the data to refetch and update in the parent
      setTimeout(() => {
        // Find the newly created note (e.g., by title, assuming titles are unique enough for this context)
        // This is a simplified approach. In a real app, the API would return the full new object.
        const newlyCreated = notes.find(n => n.title === noteData.title && n.content === noteData.content);
        if (newlyCreated) {
          setSelectedNote(newlyCreated);
        }
      }, 100); // Small delay
    } else { // If it was an existing note being updated
      setSelectedNote(prev => prev ? { ...prev, ...noteData } as Note : null);
    }
  }, [onSaveNote, notes]); // Added notes to dependencies for setTimeout logic

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    // If we were creating a new note and cancelled, clear selection
    if (!selectedNote && isEditing) {
      setSelectedNote(null);
    }
  }, [selectedNote, isEditing]);

  const handleEdit = useCallback(() => {
    setIsEditing(true); // Enter editing mode for the selected note
  }, []);

  const handleDelete = useCallback(() => {
    if (selectedNote && selectedNote.id) {
      // Using AlertDialog from Shadcn UI for confirmation instead of window.confirm
      // The actual confirmation dialog is handled in NoteEditor.tsx
      // This button just triggers the delete action directly if clicked.
      // For consistency, let's ensure confirmation is handled where the action is triggered.
      onDeleteNote(selectedNote.id);
      setSelectedNote(null); // Clear selected note after deletion
      setIsEditing(false); // Close editor if open
      toast({
        title: "Note deleted!",
        description: `Note '${selectedNote.title}' has been removed.`,
        variant: "destructive",
        duration: 3000,
      });
    } else {
      toast({
        title: "Error",
        description: "No note selected for deletion.",
        variant: "destructive",
      });
    }
  }, [selectedNote, onDeleteNote, toast]);

  return (
    <div className="flex h-[calc(100vh-120px)] bg-background rounded-lg overflow-hidden border border-border shadow-lg">
      {/* Left Pane: Note List and Controls */}
      <div className="w-full md:w-1/3 border-r border-border p-4 flex flex-col bg-card-secondary">
        <h1 className="text-2xl font-semibold text-foreground mb-4">My Notes</h1>
        <div className="flex items-center space-x-2 mb-4">
          <Input
            placeholder="Search notes..."
            className="flex-1 bg-input-background border-input text-white placeholder:text-muted-foreground focus:ring-1 focus:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            // Assuming Input component supports icon prop, if not, you'd add the icon separately
            // icon={<Search className="h-4 w-4 text-muted-foreground" />}
          />
          <Button
            onClick={handleNewNote}
            className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shrink-0"
            aria-label="Create new note"
          >
            <Plus className="h-5 w-5 mr-1" />
            New
          </Button>
        </div>
        <Separator className="mb-4 bg-border" />
        <div className="flex-1 overflow-y-auto pr-2">
          <NoteList
            notes={sortedNotes}
            selectedNoteId={selectedNote?.id || null}
            onSelectNote={handleSelectNote}
          />
          {sortedNotes.length === 0 && !searchTerm && (
            <div className="text-center text-muted-foreground py-8">
              <p>No notes yet. Click "New" to create one!</p>
            </div>
          )}
          {sortedNotes.length === 0 && searchTerm && (
            <div className="text-center text-muted-foreground py-8">
              <p>No notes found matching your search.</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Pane: Note Editor/Viewer */}
      <div className="w-full md:w-2/3 p-6 overflow-auto bg-card">
        {isEditing ? (
          <NoteEditor
            note={selectedNote}
            onSaveNote={handleSave} // Renamed prop to match NoteEditor's expectation
            onDeleteNote={handleDelete} // Pass delete handler
            onCloseEditor={handleCancel} // Pass cancel handler as close editor
          />
        ) : selectedNote ? (
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-3xl font-bold text-foreground break-words max-w-[calc(100%-120px)]">
                {selectedNote.title}
              </h2>
              <div className="flex space-x-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEdit}
                  className="hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete} // This button directly calls handleDelete
                  className="hover:bg-destructive/90 transition-colors"
                >
                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Last updated: {new Date(selectedNote.updated_at || selectedNote.created_at).toLocaleString()}
            </p>
            <div className="flex-1 overflow-y-auto whitespace-pre-wrap text-foreground leading-relaxed">
              {selectedNote.content}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              <p className="mb-4 text-lg">Select a note from the left or create a new one to get started.</p>
              <Button
                onClick={handleNewNote}
                className="bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors px-6 py-3 text-base"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Note
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notes;
