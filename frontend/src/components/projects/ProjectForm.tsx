
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Project } from "@/types/project";

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
  onSave: (project: Omit<Project, 'id' | 'createdAt'>) => void;
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
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;
    
    onSave({
      name: projectName.trim(),
      color: selectedColor,
    });
    
    setProjectName("");
    setSelectedColor(PROJECT_COLORS[0]);
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingProject ? "Edit Project" : "Create New Project"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
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
            
            <div className="space-y-2">
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