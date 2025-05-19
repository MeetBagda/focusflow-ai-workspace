
export interface Project {
  id: string;
  name: string;
  color: string;
  icon?: string;
  createdAt: string;
}

export interface ProjectWithTaskCount extends Project {
  taskCount: number;
}