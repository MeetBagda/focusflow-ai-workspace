
import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Note } from "@/types/note";

interface NoteEditorProps {
  note: Note | null;
  onSave: (note: Partial<Note>) => void;
  onCancel: () => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ note, onSave, onCancel }) => {
  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState(note?.content || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedNote: Partial<Note> = {
      id: note?.id,
      title: title.trim() || "Untitled Note",
      content,
      updatedAt: new Date().toISOString(),
    };

    if (!note?.id) {
      updatedNote.createdAt = new Date().toISOString();
    }

    onSave(updatedNote);
  };

  return (
    <Card className="w-full">
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-6 space-y-4">
          <Input
            placeholder="Note title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-medium"
          />
          <Textarea
            placeholder="Write your note here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[200px] resize-none"
          />
        </CardContent>
        <CardFooter className="justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default NoteEditor;
