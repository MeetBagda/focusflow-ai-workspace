
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
import { Task } from "@/types/task";
import { Project } from "@/types/project";
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
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  onDuplicateTask: (task: Task) => void;
  onMoveTask: (taskId: string, projectId: string) => void;
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
  const [reminderDate, setReminderDate] = useState(
    task.reminder?.date || format(new Date(), "yyyy-MM-dd")
  );
  const [reminderTime, setReminderTime] = useState(
    task.reminder?.time || format(new Date(), "HH:mm")
  );

  const handleSetPriority = (priority: Task["priority"]) => {
    onUpdateTask(task.id, { priority });
    toast({
      title: "Priority updated",
      description: `Task priority set to ${priority || "none"}`,
    });
  };

  const handleToggleRecurring = () => {
    onUpdateTask(task.id, { isRecurring: !task.isRecurring });
    toast({
      title: task.isRecurring ? "Recurring removed" : "Set as recurring",
      description: task.isRecurring 
        ? "Task is no longer recurring" 
        : "Task is now set as recurring",
    });
  };

  const handleCopyLink = () => {
    // In a real app, this would copy a link to the task
    // For now, let's just copy the task title
    navigator.clipboard.writeText(task.title);
    toast({
      title: "Link copied",
      description: "Task link copied to clipboard",
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
    const reminderObj = {
      date: reminderDate,
      time: reminderTime,
      notified: false
    };
    
    onUpdateTask(task.id, { reminder: reminderObj });
    setIsReminderDialogOpen(false);
    
    toast({
      title: "Reminder set",
      description: `Reminder set for ${format(new Date(`${reminderDate}T${reminderTime}`), "PPp")}`,
    });
  };

  const handleRemoveReminder = () => {
    onUpdateTask(task.id, { reminder: null });
    
    toast({
      title: "Reminder removed",
      description: "The reminder has been removed from this task",
    });
  };

  // Inline dropdown for mobile support
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
          {task.isRecurring ? "Remove Recurring" : "Make Recurring"}
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
            {task.isRecurring ? "Remove Recurring" : "Make Recurring"}
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
                    style={{ backgroundColor: project.color }}
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

        {/* For mobile */}
        <div className="inline-block md:hidden ml-auto">
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