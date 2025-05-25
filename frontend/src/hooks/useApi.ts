import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApi } from '@/lib/tasks';
import { projectApi } from '@/lib/projects';
import { noteApi } from '@/lib/notes';
import { toast } from '@/components/ui/use-toast';
import { Task } from '@/types/task';
import { Project } from '@/types/project';
import { Note } from '@/types/note';

export const useTasks = () => {
  const queryClient = useQueryClient();

  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => taskApi.getTasks().then(res => res.data)
  });

  const { mutate: addTask } = useMutation({
  mutationFn: (task: Partial<Task>) => {
    console.log('Raw incoming task to sanitize:', task);

    // 🔥 Handle the wrongly nested case
    // If task.title is itself an object with the full task inside it
    if (typeof task.title === 'object' && task.title !== null && 'title' in task.title) {
      task = { ...(task.title as Task) }; // Unwrap and overwrite `task`
      console.warn("⚠️ Detected nested task data in title. Unwrapped it.", task);
    }

    // 🛑 Validate title
    if (!task.title || typeof task.title !== 'string' || task.title.trim() === '') {
      console.error("❌ Title is required to create a task.");
      throw new Error("Title is required to create a task.");
    }

    const sanitizedTask = {
      title: task.title.substring(0, 250),
      description: typeof task.description === 'string' ? task.description.substring(0, 250) : null,
      due_date: task.due_date || null,
      priority: task.priority || 'medium',
      project_id: task.project_id === 0 ? null : task.project_id,
      is_recurring: Boolean(task.is_recurring),
      completed: Boolean(task.completed),
    };

    console.log("✅ Sending sanitized task:", sanitizedTask);
    return taskApi.createTask(sanitizedTask);
  },
  onSuccess: (data) => {
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
    toast({ title: "Task created successfully" });
  },
  onError: (error: any) => {
    console.error('Error creating task:', error);
    toast({
      title: "Failed to create task",
      description: error.response?.data?.error || error.message,
      variant: "destructive",
    });
  }
});


  const { mutate: updateTask } = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Task> }) => {
      // Sanitize update data as well
      const sanitizedData: Partial<Task> = {};
      
      if (data.title !== undefined) 
        sanitizedData.title = String(data.title).substring(0, 250);
      
      if (data.description !== undefined)
        sanitizedData.description = data.description ? String(data.description).substring(0, 250) : null;
      
      if (data.due_date !== undefined)
        sanitizedData.due_date = data.due_date;
      
      if (data.priority !== undefined)
        sanitizedData.priority = data.priority;
      
      if (data.project_id !== undefined)
        sanitizedData.project_id = data.project_id === 0 ? null : data.project_id;
      
      if (data.is_recurring !== undefined)
        sanitizedData.is_recurring = Boolean(data.is_recurring);
      
      if (data.completed !== undefined)
        sanitizedData.completed = Boolean(data.completed);
      
      return taskApi.updateTask(id, sanitizedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({ title: "Task updated successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to update task", 
        description: error.response?.data?.error || error.message,
        variant: "destructive"
      });
    }
  });

  // The rest of your code remains unchanged
  const { mutate: deleteTask } = useMutation({
    mutationFn: taskApi.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({ title: "Task deleted successfully" });
    }
  });

  const { mutate: duplicateTask } = useMutation({
    mutationFn: (task: Omit<Task, 'id'>) => {
      // Sanitize the duplicated task
      const sanitizedTask = {
        ...task,
        title: `${task.title} (Copy)`.substring(0, 250),
        description: task.description ? String(task.description).substring(0, 250) : null,
        id: 0
      };
      return taskApi.createTask(sanitizedTask);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({ title: "Task duplicated successfully" });
    }
  });

  return { tasks, tasksLoading, addTask, updateTask, deleteTask, duplicateTask };
};

export const useProjects = () => {
  const queryClient = useQueryClient();

  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectApi.getProjects().then(res => res.data)
  });

  const { mutate: addProject } = useMutation({
    mutationFn: projectApi.createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({ title: "Project created successfully" });
    }
  });

  const { mutate: updateProject } = useMutation({
  mutationFn: ({ id, data }: { id: number; data: Partial<Project> }) => // This is the single argument passed to `mutate`
    projectApi.updateProject(id, data as Project), // Pass them as two separate arguments to your API call
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['projects'] });
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
    toast({ title: "Project updated successfully" });
  }
});


  const { mutate: deleteProject } = useMutation({
    mutationFn: projectApi.deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] }); // Refresh tasks as some might be deleted
      toast({ title: "Project deleted successfully" });
    }
  });

  return { projects, projectsLoading, addProject, updateProject, deleteProject };
};

export const useNotes = () => {
  const queryClient = useQueryClient();

  const { data: notes, isLoading: notesLoading } = useQuery({
    queryKey: ['notes'],
    queryFn: () => noteApi.getNotes().then(res => res.data)
  });

  const { mutate: addNote } = useMutation({
    mutationFn: noteApi.createNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast({ title: "Note created successfully" });
    }
  });

  const { mutate: updateNote } = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Note> }) => 
      noteApi.updateNote(id, data as Note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast({ title: "Note updated successfully" });
    }
  });

  const { mutate: deleteNote } = useMutation({
    mutationFn: noteApi.deleteNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast({ title: "Note deleted successfully" });
    }
  });

  return { notes, notesLoading, addNote, updateNote, deleteNote };
};