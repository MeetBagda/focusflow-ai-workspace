/**
 * @fileoverview QuickNoteForm component for quickly adding a new note.
 * This component provides input fields for a note title and content,
 * which are then passed to a parent handler for persistence.
 */

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast"; // For displaying notifications

interface QuickNoteFormProps {
  // onAddNote now expects a title (string) and content (string)
  onAddNote: (title: string, content: string) => void;
}

export const QuickNoteForm: React.FC<QuickNoteFormProps> = ({ onAddNote }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isExpanded, setIsExpanded] = useState(false); // State to manage form expansion

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast({
        title: "Validation Error",
        description: "Note title cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Call the parent's onAddNote function with the title and content
      await onAddNote(title.trim(), content.trim());
      setTitle(""); // Clear input after successful add
      setContent(""); // Clear content after successful add
      setIsExpanded(false); // Collapse form after adding
      toast({
        title: "Note Added",
        description: `Note "${title.trim()}" has been added.`,
      });
    } catch (error: any) {
      console.error("Error adding quick note:", error);
      toast({
        title: "Error",
        description: `Failed to add note: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input
        type="text"
        placeholder="Quick note title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onFocus={() => setIsExpanded(true)} // Expand form on focus
        className="bg-input-background border-input text-white placeholder:text-muted-foreground focus:ring-1 focus:ring-primary"
      />
      {isExpanded && (
        <>
          <Textarea
            placeholder="Note content (optional)..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[80px] resize-y bg-input-background border-input text-white placeholder:text-muted-foreground focus:ring-1 focus:ring-primary"
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setTitle("");
                setContent("");
                setIsExpanded(false);
              }}
              className="hover:bg-accent hover:text-accent-foreground"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Add Note
            </Button>
          </div>
        </>
      )}
    </form>
  );
};
