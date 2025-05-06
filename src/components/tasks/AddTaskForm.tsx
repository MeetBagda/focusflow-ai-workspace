
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface AddTaskFormProps {
  onAddTask: (title: string, dueDate: Date | null) => void;
}

const AddTaskForm: React.FC<AddTaskFormProps> = ({ onAddTask }) => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<Date | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAddTask(title.trim(), date);
      setTitle("");
      setDate(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 items-center">
      <Input
        type="text"
        placeholder="Add a new task..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="flex-1"
      />
      
      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[40px] p-0",
              date && "text-primary"
            )}
          >
            <CalendarIcon className="h-4 w-4" />
            <span className="sr-only">Open date picker</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(date) => {
              setDate(date);
              setIsCalendarOpen(false);
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      <Button type="submit">Add</Button>
    </form>
  );
};

export default AddTaskForm;
