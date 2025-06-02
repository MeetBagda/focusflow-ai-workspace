/**
 * @fileoverview NoteEditor component for creating and editing notes.
 * This component handles the UI and local state for a single note,
 * and passes the note data to parent handlers for persistence.
 */

import React, { useState, useEffect } from 'react';
import { Note } from '@/types'; // Import the Note type
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from '@/components/ui/use-toast';

interface NoteEditorProps {
  note?: Note | null; // Optional prop for existing note to edit
  onSaveNote: (note: Omit<Note, 'user_id' | 'created_at' | 'updated_at'> | Note) => void; // Handles both add and update
  onDeleteNote: (id: number) => void; // For deleting existing notes
  onCloseEditor: () => void; // To close the editor, typically after save/cancel
}

const NoteEditor: React.FC<NoteEditorProps> = ({ note, onSaveNote, onDeleteNote, onCloseEditor }) => {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');

  // Effect to update local state if a new note prop is passed (e.g., when selecting a different note)
  useEffect(() => {
    setTitle(note?.title || '');
    setContent(note?.content || '');
  }, [note]);

  const handleSave = () => {
    if (!title.trim()) {
      toast({
        title: "Validation Error",
        description: "Note title cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    const savedNote: Omit<Note, 'user_id' | 'created_at' | 'updated_at'> | Note = note
      ? { ...note, title, content } // Existing note update
      : { title, content, id: 0 }; // New note (id will be set by backend, using 0 as placeholder)

    onSaveNote(savedNote);
    onCloseEditor(); // Close editor after saving
  };

  const handleDelete = () => {
    if (note && note.id) {
      onDeleteNote(note.id);
      onCloseEditor(); // Close editor after deleting
    } else {
      toast({
        title: "Error",
        description: "Cannot delete unsaved note.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col h-full p-4 space-y-4 bg-card rounded-lg shadow-md">
      <Input
        placeholder="Note Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="text-lg font-semibold"
      />
      <Textarea
        placeholder="Write your note here..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="flex-grow min-h-[200px] resize-none"
      />
      <div className="flex justify-end space-x-2">
        {note && ( // Show delete button only for existing notes
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your
                  note.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        <Button variant="outline" onClick={onCloseEditor}>
          Cancel
        </Button>
        <Button onClick={handleSave}>Save Note</Button>
      </div>
    </div>
  );
};

export default NoteEditor;
