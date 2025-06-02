/**
 * @fileoverview Tasks page component for displaying and managing user tasks.
 * This component integrates with useTasks and useProjects hooks for data,
 * and orchestrates various task and project-related UI components.
 */

import React, { useState, useMemo, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import AddTaskForm from "@/components/tasks/AddTaskForm";
import TaskList from "@/components/tasks/TaskList";
import { Task, Project } from "@/types"; // Import Task and Project from the main types barrel file
import ProjectSelector from "@/components/projects/ProjectSelector";
import ProjectForm from "@/components/projects/ProjectForm";
import ProjectSidebar from "@/components/projects/ProjectSidebar";
import { useToast } from "@/components/ui/use-toast";

// Import the useApi hooks from your centralized hooks directory
import { useTasks, useProjects } from "@/hooks/useApi";

interface TasksProps {
  // These props are now handled internally by the useTasks and useProjects hooks
  // and are no longer passed from App.tsx directly.
  // The component will fetch its own data and manage its own state.
}

const Tasks: React.FC<TasksProps> = () => {
  // Use the hooks to get tasks and projects data and their respective CRUD operations
  const {
    tasks,
    tasksLoading,
    tasksError,
    addTask,
    updateTask,
    deleteTask,
    duplicateTask,
    refetchTasks // Added refetch for manual refresh if needed
  } = useTasks();

  const {
    projects,
    projectsLoading,
    projectsError,
    addProject,
    updateProject,
    deleteProject,
    refetchProjects // Added refetch for manual refresh if needed
  } = useProjects();

  const [activeTab, setActiveTab] = useState<string>("all");
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const { toast } = useToast();

  // Show loading/error states
  if (tasksLoading || projectsLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-120px)] text-muted-foreground">
        Loading tasks and projects...
      </div>
    );
  }

  if (tasksError || projectsError) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-120px)] text-red-500">
        Error loading data: {tasksError || projectsError}
      </div>
    );
  }

  // Memoize date calculations to prevent re-calculation on every render
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []); // Only runs once

  const tomorrow = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + 1);
    d.setHours(0, 0, 0, 0); // Ensure tomorrow is also set to start of day
    return d;
  }, [today]); // Recalculates only if 'today' changes

  const endOfWeek = useMemo(() => {
    const d = new Date(today);
    const dayOfWeek = today.getDay(); // 0 for Sunday, 6 for Saturday
    const daysUntilEndOfWeek = 6 - dayOfWeek; // Days until next Saturday
    d.setDate(today.getDate() + daysUntilEndOfWeek);
    d.setHours(23, 59, 59, 999); // Set to end of the day for accurate range
    return d;
  }, [today]); // Recalculates only if 'today' changes

  // Memoize filtered tasks to prevent re-filtering on every render
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // First filter by project
      if (currentProject && task.project_id !== currentProject.id) return false;

      if (activeTab === "all") return true;
      if (activeTab === "completed") return task.completed;
      if (activeTab === "uncompleted") return !task.completed;

      if (!task.due_date) return activeTab === "no-date";

      const due_date = new Date(task.due_date);
      due_date.setHours(0, 0, 0, 0); // Normalize due_date to start of day for comparison

      if (activeTab === "today") return due_date.getTime() === today.getTime();
      if (activeTab === "tomorrow") return due_date.getTime() === tomorrow.getTime();
      if (activeTab === "this-week") {
        // For "this-week", tasks should be due from 'today' up to 'endOfWeek' (inclusive)
        return due_date.getTime() >= today.getTime() && due_date.getTime() <= endOfWeek.getTime();
      }
      return false;
    });
  }, [tasks, currentProject, activeTab, today, tomorrow, endOfWeek]); // Dependencies for memoization

  // Memoize task counts by project for the sidebar
  const projectsWithCounts = useMemo(() => {
    return projects.map(project => ({
      ...project,
      taskCount: (tasks || []).filter(task => task.project_id === project.id).length
    }));
  }, [projects, tasks]); // Recalculate only if 'projects' or 'tasks' change

  // Use useCallback for event handlers to prevent unnecessary re-renders of child components
  const handleAddTask = useCallback(async (title: string, dueDate: Date | null) => {
    const taskData: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
      title,
      due_date: dueDate?.toISOString() || null,
      project_id: currentProject?.id || null,
      completed: false,
      priority: "high", // Default priority
      is_recurring: false, // Default recurring status
      description: null, // Default description
      reminder: null, // Default reminder
      recurrence_pattern: null // Default recurrence pattern
    };

    try {
      await addTask(taskData); // Use the addTask from useTasks hook
      toast({
        title: "Task added",
        description: `Task '${title}' has been added.`,
      });
    } catch (error: any) {
      console.error("Error adding task:", error);
      toast({
        title: "Error",
        description: `Failed to add task: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    }
  }, [currentProject, addTask, toast]); // Dependencies for useCallback

  const handleToggleComplete = useCallback(async (id: number) => {
    const taskToUpdate = tasks.find(t => t.id === id);
    if (taskToUpdate) {
      try {
        await updateTask(id, { completed: !taskToUpdate.completed }); // Use updateTask from useTasks hook
      } catch (error: any) {
        console.error("Error toggling task complete status:", error);
        toast({
          title: "Error",
          description: `Failed to update task status: ${error.message || 'Unknown error'}`,
          variant: "destructive",
        });
      }
    }
  }, [tasks, updateTask, toast]);

  const handleDeleteTask = useCallback(async (id: number) => {
    try {
      await deleteTask(id); // Use deleteTask from useTasks hook
      toast({
        title: "Task deleted",
        description: "Task has been removed.",
      });
    } catch (error: any) {
      console.error("Error deleting task:", error);
      toast({
        title: "Error",
        description: `Failed to delete task: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    }
  }, [deleteTask, toast]);

  const handleUpdateTask = useCallback(async (id: number, updates: Partial<Task>) => {
    try {
      await updateTask(id, updates); // Use updateTask from useTasks hook
      toast({
        title: "Task updated",
        description: "Task details have been updated.",
      });
    } catch (error: any) {
      console.error("Error updating task:", error);
      toast({
        title: "Error",
        description: `Failed to update task: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    }
  }, [updateTask, toast]);

  const handleDuplicateTask = useCallback(async (task: Task) => {
    try {
      await duplicateTask(task); // Use duplicateTask from useTasks hook
      toast({
        title: "Task duplicated",
        description: `Task '${task.title}' duplicated.`,
      });
    } catch (error: any) {
      console.error("Error duplicating task:", error);
      toast({
        title: "Error",
        description: `Failed to duplicate task: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    }
  }, [duplicateTask, toast]);

  const handleMoveTask = useCallback(async (taskId: number, projectId: number) => {
    try {
      await updateTask(taskId, { project_id: projectId }); // Use updateTask from useTasks hook
      toast({
        title: "Task moved",
        description: `Task moved to ${projects.find(p => p.id === projectId)?.name || 'another project'}`,
      });
    } catch (error: any) {
      console.error("Error moving task:", error);
      toast({
        title: "Error",
        description: `Failed to move task: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    }
  }, [updateTask, projects, toast]);

  const handleAddProject = useCallback(async (projectData: Omit<Project, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      await addProject(projectData); // Use addProject from useProjects hook
      toast({
        title: "Project created",
        description: `Project '${projectData.name}' has been created.`,
      });
    } catch (error: any) {
      console.error("Error adding project:", error);
      toast({
        title: "Error",
        description: `Failed to add project: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    }
  }, [addProject, toast]);

  const handleUpdateProject = useCallback(async (id: number, updates: Partial<Project>) => {
    try {
      await updateProject(id, updates); // Use updateProject from useProjects hook
      toast({
        title: "Project updated",
        description: "Project details have been updated.",
      });
      // If the current project was updated, ensure its name/color updates in the selector
      if (currentProject && currentProject.id === id) {
        setCurrentProject(prev => prev ? { ...prev, ...updates } as Project : null);
      }
    } catch (error: any) {
      console.error("Error updating project:", error);
      toast({
        title: "Error",
        description: `Failed to update project: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    }
  }, [updateProject, currentProject, toast]);

  const handleDeleteProject = useCallback(async (id: number) => {
    try {
      await deleteProject(id); // Use deleteProject from useProjects hook
      setCurrentProject(null); // Clear selected project after deletion
      toast({
        title: "Project deleted",
        description: "Project has been removed.",
      });
    } catch (error: any) {
      console.error("Error deleting project:", error);
      toast({
        title: "Error",
        description: `Failed to delete project: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    }
  }, [deleteProject, toast]);

  const handleEditProject = useCallback(() => {
    if (!currentProject) return;
    setEditingProject(currentProject);
    setIsProjectFormOpen(true);
  }, [currentProject]);


  return (
    <div className="flex flex-col md:flex-row md:gap-6 h-full"> {/* Ensure full height for layout */}
      {/* Project sidebar - visible on medium screens and up */}
      <div className="hidden md:block w-64 border-r border-border bg-card-secondary p-4 rounded-lg shadow-md">
        <ProjectSidebar
          projects={projectsWithCounts}
          currentProjectId={currentProject?.id || null}
          onSelectProject={(projectId) =>
            setCurrentProject(projectId ? projects.find(p => p.id === projectId) || null : null)
          }
          onAddProject={() => {
            setEditingProject(null); // Ensure no project is being edited when adding new
            setIsProjectFormOpen(true);
          }}
        />
      </div>

      <div className="flex-1 space-y-6 p-4 md:p-0"> {/* Added padding for mobile */}
        <div>
          <h1 className="text-3xl font-semibold mb-2">
            {currentProject ? currentProject.name : "All Tasks"}
          </h1>

          {/* Project selector for mobile */}
          <div className="md:hidden mb-6">
            <ProjectSelector
              projects={projects}
              currentProject={currentProject}
              onSelectProject={setCurrentProject}
              onAddProject={() => {
                setEditingProject(null);
                setIsProjectFormOpen(true);
              }}
            />
          </div>

          {/* Project actions - only visible when a project is selected */}
          {currentProject && (
            <div className="flex gap-2 mb-6">
              <Button variant="outline" size="sm" onClick={handleEditProject}>
                Edit Project
              </Button>
              <Button
                variant="destructive" // Changed to destructive for delete action
                size="sm"
                onClick={() => handleDeleteProject(currentProject.id)} // Pass ID to handler
              >
                Delete Project
              </Button>
            </div>
          )}

          <AddTaskForm onAddTask={handleAddTask} />
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 md:grid-cols-7 mb-4 w-full"> {/* Full width for mobile */}
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="tomorrow">Tomorrow</TabsTrigger>
            <TabsTrigger value="this-week">This Week</TabsTrigger>
            <TabsTrigger value="no-date">No Date</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="uncompleted">Uncompleted</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            <TaskList
              tasks={filteredTasks}
              onToggleComplete={handleToggleComplete}
              onDelete={handleDeleteTask}
              onUpdateTask={handleUpdateTask}
              onDuplicateTask={handleDuplicateTask}
              onMoveTask={handleMoveTask}
              projects={projects}
              showProjectBadge={!currentProject}
              currentProject={currentProject}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Project form dialog */}
      <ProjectForm
        open={isProjectFormOpen}
        onOpenChange={setIsProjectFormOpen}
        onSave={(projectData) => {
          if (editingProject) {
            handleUpdateProject(editingProject.id, projectData as Partial<Project>);
          } else {
            handleAddProject(projectData as Omit<Project, 'id' | 'user_id' | 'created_at' | 'updated_at'>);
          }
          setEditingProject(null); // Clear editing project after save
        }}
        editingProject={editingProject}
      />
    </div>
  );
};

export default Tasks;
