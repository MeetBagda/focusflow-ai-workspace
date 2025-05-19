import React, { useState } from "react";
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

interface TasksProps {
  tasks: Task[];
  projects: Project[];
  onAddTask: (title: string, dueDate: Date | null, projectId?: string) => void;
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

  // Get today's date (without time)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get tomorrow's date
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Get end of current week
  const endOfWeek = new Date(today);
  const dayOfWeek = today.getDay();
  const daysUntilEndOfWeek = 6 - dayOfWeek;
  endOfWeek.setDate(today.getDate() + daysUntilEndOfWeek);

  // Filter tasks based on active tab and current project
  const filteredTasks = tasks.filter((task) => {
    // First filter by project
    if (currentProject && task.projectId !== currentProject.id) return false;

    if (activeTab === "all") return true;
    if (activeTab === "completed") return task.completed;
    if (activeTab === "uncompleted") return !task.completed;

    if (!task.dueDate) return activeTab === "no-date";

    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);

    if (activeTab === "today") return dueDate.getTime() === today.getTime();
    if (activeTab === "tomorrow") return dueDate.getTime() === tomorrow.getTime();
    if (activeTab === "this-week") {
      return dueDate > today && dueDate <= endOfWeek;
    }
    return false;
  });

  // Calculate task counts by project for the sidebar
  const projectsWithCounts: ProjectWithTaskCount[] = projects.map(project => ({
    ...project,
    taskCount: (tasks || []).filter(task => task.projectId === project.id).length
  }));

  // Handle adding a new task
  const handleAddTask = (title: string, dueDate: Date | null) => {
    const projectId = currentProject?.id;
    onAddTask(title, dueDate, projectId);
  };

  // Handle moving a task to a different project
  const handleMoveTask = (taskId: string, projectId: string) => {
    onUpdateTask(taskId, { projectId });
    toast({
      title: "Task moved",
      description: `Task moved to ${projects.find(p => p.id === projectId)?.name || 'another project'}`,
    });
  };

  // Handle adding a new project
  const handleAddProject = (projectData: Omit<Project, 'id' | 'createdAt'>) => {
    onAddProject(projectData);
    toast({
      title: "Project created",
      description: `Project '${projectData.name}' has been created`,
    });
  };

  // Handle opening the project form for editing
  const handleEditProject = () => {
    if (!currentProject) return;
    setEditingProject(currentProject);
    setIsProjectFormOpen(true);
  };

  // Handle updating a project
  const handleUpdateProject = (projectData: Omit<Project, 'id' | 'createdAt'>) => {
    if (!editingProject) return;
    onUpdateProject(editingProject.id, projectData);
    toast({
      title: "Project updated",
      description: `Project '${projectData.name}' has been updated`,
    });
    setEditingProject(null);
  };

  // Handle deleting a project
  const handleDeleteProject = () => {
    if (!currentProject) return;
    onDeleteProject(currentProject.id);
    setCurrentProject(null);
    toast({
      title: "Project deleted",
      description: `Project '${currentProject.name}' has been deleted`,
    });
  };

  return (
    <div className="flex flex-col md:flex-row md:gap-6">
      {/* Project sidebar - visible on medium screens and up */}
      <div className="hidden md:block w-64 border-r">
        <ProjectSidebar
          projects={projectsWithCounts}
          currentProjectId={currentProject?.id || null}
          onSelectProject={(projectId) => 
            setCurrentProject(projectId ? projects.find(p => p.id === projectId) || null : null)
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