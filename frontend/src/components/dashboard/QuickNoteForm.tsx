import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

interface QuickNoteFormProps {
  onAddNote?: (content: string) => void;
}

export const QuickNoteForm: React.FC<QuickNoteFormProps> = ({ onAddNote }) => {
  const [content, setContent] = useState("");
  const { toast } = useToast();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) return;
    
    // If we have a direct handler from props, use it
    if (onAddNote) {
      onAddNote(content.trim());
    } else {
      // Otherwise dispatch a custom event that App component can listen to
      const event = new CustomEvent("app:addNote", { 
        detail: { 
          title: content.trim().split('\n')[0].substring(0, 30) || "Quick Note", 
          content: content.trim() 
        }
      });
      document.dispatchEvent(event);
      
      toast({
        title: "Note saved",
        description: "Your quick note has been saved",
      });
    }
    
    setContent("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write something..."
        className="min-h-[120px] resize-none"
      />
      <Button type="submit" className="w-full">
        Save Note
      </Button>
    </form>
  );
};
