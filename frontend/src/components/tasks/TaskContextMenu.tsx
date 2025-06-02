/**
 * @fileoverview TaskContextMenu component provides a context menu (right-click)
 * and a dropdown menu (mobile) for various task actions like setting priority,
 * reminders, duplicating, moving, and deleting.
 */

import React, { useState } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Task, Project } from "@/types"; // Import Task and Project from the main types barrel file
import { Calendar, Flag, Clock, Copy, Move, Link, Trash2, MoreHorizontal, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

interface TaskContextMenuProps {
  task: Task;
  children: React.ReactNode;
  projects: Project[];
  onUpdateTask: (id: number, updates: Partial<Task>) => void; // Changed id type to number
  onDeleteTask: (id: number) => void; // Changed id type to number
  onDuplicateTask: (task: Task) => void;
  onMoveTask: (taskId: number, projectId: number) => void; // Changed id types to number
}

const TaskContextMenu: React.FC<TaskContextMenuProps> = ({
  task,
  children,
  projects,
  onUpdateTask,
  onDeleteTask,
  onDuplicateTask,
  onMoveTask,
}) => {
  const { toast } = useToast();
  const [isReminderDialogOpen, setIsReminderDialogOpen] = useState(false);
  // Initialize reminderDate and reminderTime from existing task reminder or current date/time
  const [reminderDate, setReminderDate] = useState(
    task.reminder?.date ? format(new Date(task.reminder.date), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd")
  );
  const [reminderTime, setReminderTime] = useState(
    task.reminder?.time || format(new Date(), "HH:mm")
  );

  // Update local reminder state when task prop changes (e.g., if reminder is set/cleared externally)
  React.useEffect(() => {
    setReminderDate(
      task.reminder?.date ? format(new Date(task.reminder.date), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd")
    );
    setReminderTime(task.reminder?.time || format(new Date(), "HH:mm"));
  }, [task.reminder]);


  const handleSetPriority = (priority: Task["priority"]) => {
    onUpdateTask(task.id, { priority });
    toast({
      title: "Priority updated",
      description: `Task priority set to ${priority || "none"}`,
    });
  };

  const handleToggleRecurring = () => {
    onUpdateTask(task.id, { is_recurring: !task.is_recurring }); // Use is_recurring
    toast({
      title: task.is_recurring ? "Recurring removed" : "Set as recurring",
      description: task.is_recurring
        ? "Task is no longer recurring"
        : "Task is now set as recurring",
    });
  };

  const handleCopyLink = () => {
    // In a real app, this would copy a sharable link to the task's detail page
    // For now, let's just copy the task title
    navigator.clipboard.writeText(task.title);
    toast({
      title: "Link copied",
      description: "Task title copied to clipboard",
    });
  };

  const handleDuplicate = () => {
    onDuplicateTask(task);
    toast({
      title: "Task duplicated",
      description: "A copy of this task has been created",
    });
  };

  const handleSetReminder = () => {
    const reminderDateTime = new Date(`${reminderDate}T${reminderTime}`);
    if (isNaN(reminderDateTime.getTime())) {
      toast({
        title: "Invalid Date/Time",
        description: "Please enter a valid date and time for the reminder.",
        variant: "destructive",
      });
      return;
    }

    const reminderObj: Task['reminder'] = { // Ensure type matches Task['reminder']
      date: format(reminderDateTime, "yyyy-MM-dd"), // Store just the date part
      time: format(reminderDateTime, "HH:mm"), // Store just the time part
      notified: false, // Default to false
      // Add other reminder properties if your Task type has them (e.g., timestamp, message)
      // timestamp: reminderDateTime.toISOString(),
    };

    onUpdateTask(task.id, { reminder: reminderObj });
    setIsReminderDialogOpen(false); // Close dialog

    toast({
      title: "Reminder set",
      description: `Reminder set for ${format(reminderDateTime, "PPp")}`,
    });
  };

  const handleRemoveReminder = () => {
    onUpdateTask(task.id, { reminder: null });

    toast({
      title: "Reminder removed",
      description: "The reminder has been removed from this task",
    });
  };

  // Inline dropdown for mobile support (moved to be a direct child of ContextMenu)
  // This structure might be slightly off; typically ContextMenu and DropdownMenu are used for different interactions.
  // For simplicity, let's assume `children` contains the element that triggers the context menu.
  // The mobile dropdown should probably be rendered outside the ContextMenu or conditionally.
  // For now, I'll keep the structure as close to yours as possible but note the potential for refinement.
  const TaskDropdownMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleSetPriority("high")}>
          <Flag className="mr-2 h-4 w-4 text-red-500" />
          High Priority
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSetPriority("medium")}>
          <Flag className="mr-2 h-4 w-4 text-amber-500" />
          Medium Priority
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSetPriority("low")}>
          <Flag className="mr-2 h-4 w-4 text-blue-500" />
          Low Priority
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSetPriority(null)}>
          <Flag className="mr-2 h-4 w-4 text-gray-300" />
          No Priority
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleToggleRecurring}>
          <Clock className="mr-2 h-4 w-4" />
          {task.is_recurring ? "Remove Recurring" : "Make Recurring"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setIsReminderDialogOpen(true)}>
          <Bell className="mr-2 h-4 w-4" />
          Set Reminder
        </DropdownMenuItem>
        {task.reminder && (
          <DropdownMenuItem onClick={handleRemoveReminder}>
            <Bell className="mr-2 h-4 w-4 text-red-500" />
            Remove Reminder
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDuplicate}>
          <Copy className="mr-2 h-4 w-4" />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopyLink}>
          <Link className="mr-2 h-4 w-4" />
          Copy Link
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {/* Move to Project sub-menu */}
        {projects.length > 0 && (
          <>
            <DropdownMenuItem className="font-semibold" disabled>
              <Move className="mr-2 h-4 w-4" />
              Move to Project
            </DropdownMenuItem>
            {projects.map((project) => (
              <DropdownMenuItem
                key={project.id}
                onClick={() => onMoveTask(task.id, project.id)}
                className="pl-8"
              >
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: project.color || '#ccc' }}
                />
                {project.name}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem
          onClick={() => onDeleteTask(task.id)}
          className="text-red-500 focus:text-red-500"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <>
      {/* Context Menu (for desktop) */}
      <ContextMenu>
        <ContextMenuTrigger>{children}</ContextMenuTrigger>
        <ContextMenuContent className="w-56">
          <ContextMenuItem onClick={() => handleSetPriority("high")}>
            <Flag className="mr-2 h-4 w-4 text-red-500" />
            High Priority
          </ContextMenuItem>
          <ContextMenuItem onClick={() => handleSetPriority("medium")}>
            <Flag className="mr-2 h-4 w-4 text-amber-500" />
            Medium Priority
          </ContextMenuItem>
          <ContextMenuItem onClick={() => handleSetPriority("low")}>
            <Flag className="mr-2 h-4 w-4 text-blue-500" />
            Low Priority
          </ContextMenuItem>
          <ContextMenuItem onClick={() => handleSetPriority(null)}>
            <Flag className="mr-2 h-4 w-4 text-gray-300" />
            No Priority
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={handleToggleRecurring}>
            <Clock className="mr-2 h-4 w-4" />
            {task.is_recurring ? "Remove Recurring" : "Make Recurring"}
          </ContextMenuItem>
          <ContextMenuItem onClick={() => setIsReminderDialogOpen(true)}>
            <Bell className="mr-2 h-4 w-4" />
            Set Reminder
          </ContextMenuItem>
          {task.reminder && (
            <ContextMenuItem onClick={handleRemoveReminder}>
              <Bell className="mr-2 h-4 w-4 text-red-500" />
              Remove Reminder
            </ContextMenuItem>
          )}
          <ContextMenuSeparator />
          <ContextMenuItem onClick={handleDuplicate}>
            <Copy className="mr-2 h-4 w-4" />
            Duplicate
          </ContextMenuItem>
          <ContextMenuItem onClick={handleCopyLink}>
            <Link className="mr-2 h-4 w-4" />
            Copy Link
          </ContextMenuItem>
          <ContextMenuSeparator />
          {/* Move to Project sub-menu */}
          {projects.length > 0 && (
            <>
              <ContextMenuItem className="font-semibold" disabled>
                <Move className="mr-2 h-4 w-4" />
                Move to Project
              </ContextMenuItem>
              {projects.map((project) => (
                <ContextMenuItem
                  key={project.id}
                  onClick={() => onMoveTask(task.id, project.id)}
                  className="pl-8"
                >
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: project.color || '#ccc' }}
                  />
                  {project.name}
                </ContextMenuItem>
              ))}
              <ContextMenuSeparator />
            </>
          )}
          <ContextMenuItem
            onClick={() => onDeleteTask(task.id)}
            className="text-red-500 focus:text-red-500"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </ContextMenuItem>
        </ContextMenuContent>

        {/* For mobile: Use a regular DropdownMenu as ContextMenu typically for right-click */}
        {/* This part needs careful integration within your layout, as 'ml-auto' assumes specific flex parent */}
        <div className="inline-block md:hidden ml-auto">
           {/* You might want to wrap `children` with an element that has `relative` positioning if the dropdown button needs to be absolutely positioned relative to it */}
          <TaskDropdownMenu />
        </div>
      </ContextMenu>

      {/* Reminder Dialog */}
      <Dialog open={isReminderDialogOpen} onOpenChange={setIsReminderDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Set Reminder</DialogTitle>
            <DialogDescription>
              Choose when you want to be reminded about this task.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reminder-date" className="text-right">
                Date
              </Label>
              <Input
                id="reminder-date"
                type="date"
                value={reminderDate}
                onChange={(e) => setReminderDate(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reminder-time" className="text-right">
                Time
              </Label>
              <Input
                id="reminder-time"
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsReminderDialogOpen(false)} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleSetReminder}>Save Reminder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TaskContextMenu;
