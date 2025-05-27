import React, { useState, useMemo, useCallback } from "react"; // Import useMemo and useCallback
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import AddTaskForm from "@/components/tasks/AddTaskForm";
import TaskList from "@/components/tasks/TaskList";
import { Task } from "@/types/task";
import { Project, ProjectWithTaskCount } from "@/types/project";
import ProjectSelector from "@/components/projects/ProjectSelector";
import ProjectForm from "@/components/projects/ProjectForm";
import ProjectSidebar from "@/components/projects/ProjectSidebar";
import { useToast } from "@/components/ui/use-toast";
import { apiClient } from "@/lib/client"; // Keep apiClient if used elsewhere in the app
import { taskApi } from "@/lib/tasks"; // Keep taskApi if used elsewhere in the app

interface TasksProps {
  tasks: Task[];
  projects: Project[];
  onAddTask: (task: Partial<Task>) => void;
  onToggleComplete: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDuplicateTask: (task: Task) => void;
  onAddProject: (project: Omit<Project, 'id' | 'createdAt'>) => void;
  onUpdateProject: (id: string, updates: Partial<Project>) => void;
  onDeleteProject: (id: string) => void;
}

const Tasks: React.FC<TasksProps> = ({
  tasks,
  projects,
  onAddTask,
  onToggleComplete,
  onDeleteTask,
  onUpdateTask,
  onDuplicateTask,
  onAddProject,
  onUpdateProject,
  onDeleteProject,
}) => {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const { toast } = useToast();

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
  const projectsWithCounts: ProjectWithTaskCount[] = useMemo(() => {
    return projects.map(project => ({
      ...project,
      taskCount: (tasks || []).filter(task => task.project_id === project.id).length
    }));
  }, [projects, tasks]); // Recalculate only if 'projects' or 'tasks' change

  // Use useCallback for event handlers to prevent unnecessary re-renders of child components
  const handleAddTask = useCallback(async (title: string, dueDate: Date | null) => {
    const taskData = {
      title,
      due_date: dueDate?.toISOString() || null,
      project_id: currentProject?.id || null,
      completed: false,
      priority: "high", // Default priority
      is_recurring: false, // Default recurring status
      description: null // Default description
    };

    console.log('Creating task with data:', taskData); // Debug log
    try {
      const response = await taskApi.createTask(taskData); // Send POST request to tasks endpoint
      const createdTask = response.data; // Extract the created task from response
      onAddTask(createdTask); // Use the createdTask from the API response
      toast({
        title: "Task added",
        description: `Task '${title}' has been added.`,
      });
    } catch (error) {
      console.error("Error adding task:", error);
      toast({
        title: "Error",
        description: "Failed to add task. Please try again.",
        variant: "destructive",
      });
    }
  }, [currentProject, onAddTask, toast]); // Dependencies for useCallback

  const handleMoveTask = useCallback((taskId: string, projectId: string) => {
    onUpdateTask(taskId, { project_id: Number(projectId) });
    toast({
      title: "Task moved",
      description: `Task moved to ${projects.find(p => p.id === Number(projectId))?.name || 'another project'}`,
    });
  }, [onUpdateTask, projects, toast]);

  const handleAddProject = useCallback((projectData: Omit<Project, 'id' | 'createdAt'>) => {
    onAddProject(projectData);
    toast({
      title: "Project created",
      description: `Project '${projectData.name}' has been created`,
    });
  }, [onAddProject, toast]);

  const handleEditProject = useCallback(() => {
    if (!currentProject) return;
    setEditingProject(currentProject);
    setIsProjectFormOpen(true);
  }, [currentProject]);

  const handleUpdateProject = useCallback((projectData: Omit<Project, 'id' | 'createdAt'>) => {
    if (!editingProject) return;
    onUpdateProject(editingProject.id, projectData);
    toast({
      title: "Project updated",
      description: `Project '${projectData.name}' has been updated`,
    });
    setEditingProject(null);
  }, [editingProject, onUpdateProject, toast]);

  const handleDeleteProject = useCallback(() => {
    if (!currentProject) return;
    onDeleteProject(currentProject.id);
    setCurrentProject(null);
    toast({
      title: "Project deleted",
      description: `Project '${currentProject.name}' has been deleted`,
    });
  }, [currentProject, onDeleteProject, toast]);

  return (
    <div className="flex flex-col md:flex-row md:gap-6">
      {/* Project sidebar - visible on medium screens and up */}
      <div className="hidden md:block w-64 border-r border-border bg-card rounded-lg"> {/* Added bg-card for consistent styling */}
        <ProjectSidebar
          projects={projectsWithCounts}
          currentproject_id={currentProject?.id || null}
          onSelectProject={(projectId) =>
            setCurrentProject(projectId ? projects.find(p => p.id === Number(projectId)) || null : null)
          }
          onAddProject={() => {
            setEditingProject(null);
            setIsProjectFormOpen(true);
          }}
        />
      </div>

      <div className="flex-1 space-y-6">
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
                variant="outline"
                size="sm"
                className="text-red-500"
                onClick={handleDeleteProject}
              >
                Delete Project
              </Button>
            </div>
          )}

          <AddTaskForm onAddTask={handleAddTask} />
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 md:grid-cols-7 mb-4">
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
              onToggleComplete={onToggleComplete}
              onDelete={onDeleteTask}
              onUpdateTask={onUpdateTask}
              onDuplicateTask={onDuplicateTask}
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
        onSave={editingProject ? handleUpdateProject : handleAddProject}
        editingProject={editingProject}
      />
    </div>
  );
};

export default Tasks;
