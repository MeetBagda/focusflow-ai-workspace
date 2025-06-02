/**
 * @fileoverview QuickTaskForm component for quickly adding a new task.
 * This component provides a simple input field to add a task title,
 * and optionally a due date, which is then passed to a parent handler.
 */

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils"; // Assuming 'cn' is a utility for class concatenation
import { toast } from "@/components/ui/use-toast"; // For displaying notifications

interface QuickTaskFormProps {
  // onAddTask now expects a title (string) and an optional dueDate (Date | null)
  onAddTask: (title: string, dueDate: Date | null) => void;
  initialValue?: string; // Optional initial value for the input
}

export const QuickTaskForm: React.FC<QuickTaskFormProps> = ({ onAddTask, initialValue = "" }) => {
  const [title, setTitle] = useState(initialValue);
  const [date, setDate] = useState<Date | undefined>(undefined); // Use undefined for no date selected
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast({
        title: "Validation Error",
        description: "Task title cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Call the parent's onAddTask function with the title and date
      await onAddTask(title.trim(), date || null); // Pass null if date is undefined
      setTitle(""); // Clear input after successful add
      setDate(undefined); // Clear date after successful add
      toast({
        title: "Task Added",
        description: `Task "${title.trim()}" has been added.`,
      });
    } catch (error: any) {
      console.error("Error adding quick task:", error);
      toast({
        title: "Error",
        description: `Failed to add task: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-center">
      <Input
        type="text"
        placeholder="Add a quick task..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="flex-1 bg-input-background border-input text-white placeholder:text-muted-foreground focus:ring-1 focus:ring-primary"
      />

      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-10 h-10 p-0 rounded-md", // Adjusted size for better touch target
              date && "text-primary border-primary" // Highlight button if date is selected
            )}
            aria-label="Select due date"
          >
            <CalendarIcon className="h-5 w-5" /> {/* Increased icon size */}
            <span className="sr-only">Open date picker</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(selectedDate) => {
              setDate(selectedDate);
              setIsCalendarOpen(false);
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      <Button
        type="submit"
        className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors h-10 px-4 rounded-md" // Adjusted size
      >
        Add
      </Button>
    </form>
  );
};
