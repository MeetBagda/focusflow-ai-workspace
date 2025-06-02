/**
 * @fileoverview ProjectForm component for creating and editing projects.
 * This component handles the UI for project input and color selection,
 * passing data to a parent handler for persistence.
 */

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Project } from "@/types"; // Import Project from the main types barrel file
import { toast } from '@/components/ui/use-toast'; // Assuming you have toast for validation feedback

// Predefined color options
const PROJECT_COLORS = [
  "#ff5252", // Red
  "#ff7043", // Deep Orange
  "#ffca28", // Amber
  "#66bb6a", // Green
  "#26c6da", // Cyan
  "#42a5f5", // Blue
  "#5c6bc0", // Indigo
  "#ab47bc", // Purple
  "#ec407a", // Pink
  "#78909c", // Blue Grey
];

interface ProjectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // onSave now accepts either a new project (omitting generated fields) or an existing project (for updates)
  onSave: (project: Omit<Project, 'id' | 'user_id' | 'created_at' | 'updated_at'> | Project) => void;
  editingProject?: Project | null;
}

const ProjectForm: React.FC<ProjectFormProps> = ({
  open,
  onOpenChange,
  onSave,
  editingProject = null,
}) => {
  const [projectName, setProjectName] = useState(editingProject?.name || "");
  const [selectedColor, setSelectedColor] = useState(editingProject?.color || PROJECT_COLORS[0]);

  // Effect to update form state if a new editingProject is provided
  useEffect(() => {
    setProjectName(editingProject?.name || "");
    setSelectedColor(editingProject?.color || PROJECT_COLORS[0]);
  }, [editingProject]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) {
      toast({
        title: "Validation Error",
        description: "Project name cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    // Determine if we are creating or updating
    const projectToSave: Omit<Project, 'id' | 'user_id' | 'created_at' | 'updated_at'> | Project = editingProject
      ? { ...editingProject, name: projectName.trim(), color: selectedColor } // Existing project for update
      : { name: projectName.trim(), color: selectedColor }; // New project

    onSave(projectToSave); // Pass the data to the parent handler

    // Reset form for next use if it was a new project or dialog is closing
    if (!editingProject) {
      setProjectName("");
      setSelectedColor(PROJECT_COLORS[0]);
    }
    onOpenChange(false); // Close dialog
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editingProject ? "Edit Project" : "Create New Project"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="projectName" className="text-sm font-medium">
                Project Name
              </label>
              <Input
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter project name..."
                autoFocus
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">
                Project Color
              </label>
              <div className="flex flex-wrap gap-2">
                {PROJECT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-6 h-6 rounded-full transition-all ${
                      selectedColor === color ? 'ring-2 ring-offset-2 ring-primary' : ''
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                    aria-label={`Select ${color} color`}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingProject ? "Update Project" : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectForm;
