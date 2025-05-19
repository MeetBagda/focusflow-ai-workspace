
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface QuickTaskFormProps {
  onAddTask?: (title: string) => void;
  initialValue?: string;
}

export const QuickTaskForm: React.FC<QuickTaskFormProps> = ({ 
  onAddTask,
  initialValue = ""
}) => {
  const [title, setTitle] = useState(initialValue);
  const { toast } = useToast();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;
    
    // If we have a direct handler from props, use it
    if (onAddTask) {
      onAddTask(title.trim());
    } else {
      // Otherwise dispatch a custom event that App component can listen to
      const event = new CustomEvent("app:addTask", { 
        detail: { title: title.trim(), dueDate: new Date() }
      });
      document.dispatchEvent(event);
      
      toast({
        title: "Task added",
        description: "Your task has been added for today",
      });
    }
    
    setTitle("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-4">
      <Input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Add a task for today..."
        className="flex-1"
      />
      <Button size="sm" type="submit">
        <Plus className="h-4 w-4 mr-1" />
        Add
      </Button>
    </form>
  );
};
