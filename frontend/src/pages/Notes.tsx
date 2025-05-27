import React, { useState, useMemo, useCallback } from "react";
import { Note } from "@/types/note";
import NoteList from "@/components/notes/NoteList"; // Assuming this component exists
import NoteEditor from "@/components/notes/NoteEditor"; // Assuming this component exists
import { Button } from "@/components/ui/button"; // Assuming a Shadcn UI Button component
import { Input } from "@/components/ui/input"; // Assuming a Shadcn UI Input component
import { Search, Plus, Edit, Trash2, X } from "lucide-react"; // Icons for search, new, edit, delete, cancel
import { Separator } from "@/components/ui/separator"; // Assuming a Shadcn UI Separator component
import { toast } from "@/components/ui/use-toast"; // Assuming useToast hook

interface NotesProps {
  notes: Note[];
  onSaveNote: (note: Partial<Note>) => void;
  onDeleteNote: (id: string) => void;
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
      new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
    );
  }, [filteredNotes]);

  const handleSelectNote = useCallback((note: Note) => {
    setSelectedNote(note);
    setIsEditing(false);
  }, []);

  const handleNewNote = useCallback(() => {
    setSelectedNote(null);
    setIsEditing(true);
  }, []);

  const handleSave = useCallback((note: Partial<Note>) => {
    onSaveNote(note);
    setIsEditing(false);
    toast({
      title: "Note saved!",
      description: note.id ? `Note '${note.title}' updated.` : `New note '${note.title}' created.`,
      duration: 3000,
    });

    // A more robust way to handle new note selection would be for onSaveNote
    // to return the full new note object with its ID.
    // For now, this setTimeout is a workaround to select the newly created note.
    if (!note.id) {
      setTimeout(() => {
        // Assuming the parent state `notes` will be updated shortly after `onSaveNote`
        // Find the newly created note (e.g., by title, or if backend returns ID)
        // This part needs to be robustly handled by your data fetching/mutation logic
        // For demonstration, we'll rely on the sort to bring the newest to top.
        // A better approach: `onSaveNote` resolves with the new note's full data.
        const newlyCreatedNote = notes.find(n => n.title === note.title && !n.id); // This is a weak check
        if (newlyCreatedNote) {
            setSelectedNote(newlyCreatedNote);
        }
      }, 500); // Give a small delay for parent state to update
    } else {
        // If it's an update, ensure selected note reflects the latest state
        setSelectedNote(prev => prev ? { ...prev, ...note } as Note : null);
    }
  }, [onSaveNote, notes, toast]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    // If a note was selected before editing, revert to viewing it
    if (selectedNote && !selectedNote.id) { // If it was a new, unsaved note
      setSelectedNote(null); // Clear selection
    }
  }, [selectedNote]);

  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleDelete = useCallback(() => {
    if (selectedNote && window.confirm(`Are you sure you want to delete "${selectedNote.title}"?`)) { // Using window.confirm for simplicity, replace with custom modal
      onDeleteNote(selectedNote.id);
      setSelectedNote(null);
      setIsEditing(false); // Close editor if open
      toast({
        title: "Note deleted!",
        description: `Note '${selectedNote.title}' has been removed.`,
        variant: "destructive",
        duration: 3000,
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
            className="flex-1 bg-input-background border-input text-black font-medium placeholder:text-muted-foreground focus:ring-1 focus:ring-primary" // Changed text-foreground to text-white
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="h-4 w-4 text-muted-foreground" />} // Assuming Input component supports icon prop
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
        <div className="flex-1 overflow-y-auto pr-2"> {/* Added pr-2 for scrollbar spacing */}
          <NoteList
            notes={sortedNotes}
            selectedNoteId={selectedNote?.id || null}
            onSelectNote={handleSelectNote}
            // onNewNote is handled by the button above
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
            onSave={handleSave}
            onCancel={handleCancel}
          />
        ) : selectedNote ? (
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-start mb-4"> {/* Changed items-center to items-start */}
              <h2 className="text-3xl font-bold text-foreground break-words max-w-[calc(100%-120px)]"> {/* Added break-words and max-width */}
                {selectedNote.title}
              </h2>
              <div className="flex space-x-2 shrink-0"> {/* Added shrink-0 */}
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
                  onClick={handleDelete}
                  className="hover:bg-destructive/90 transition-colors"
                >
                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Last updated: {new Date(selectedNote.updatedAt || selectedNote.createdAt).toLocaleString()}
            </p>
            <div className="flex-1 overflow-y-auto whitespace-pre-wrap text-foreground leading-relaxed"> {/* Added flex-1 and leading-relaxed */}
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
