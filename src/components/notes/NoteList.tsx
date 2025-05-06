
import React from "react";
import { Note } from "@/types/note";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NoteListProps {
  notes: Note[];
  selectedNoteId: string | null;
  onSelectNote: (note: Note) => void;
  onNewNote: () => void;
}

const NoteList: React.FC<NoteListProps> = ({
  notes,
  selectedNoteId,
  onSelectNote,
  onNewNote,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">My Notes</h2>
        <Button onClick={onNewNote} size="sm">New Note</Button>
      </div>

      <div className="overflow-y-auto flex-1">
        {notes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No notes yet. Create your first note!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notes.map((note) => (
              <Card 
                key={note.id}
                className={cn(
                  "cursor-pointer hover:bg-accent/30 transition-colors",
                  selectedNoteId === note.id && "bg-accent/50 border-accent"
                )}
                onClick={() => onSelectNote(note)}
              >
                <CardContent className="p-3">
                  <h3 className="font-medium truncate mb-1">{note.title}</h3>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <p className="truncate flex-1">{note.content.substring(0, 50)}{note.content.length > 50 ? '...' : ''}</p>
                    <p className="ml-2">{formatDate(note.updatedAt || note.createdAt)}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NoteList;
