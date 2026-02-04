
export interface ProjectUpdate {
  id: string;
  teamMember: string;
  title: string; // Member Title
  date: string; // Update Date
  priorityGoal: string; // e.g. Engagement
  initiative: string; // Project Name/Key Initiatives
  description: string; // Update Description
  health: number; // -1, 0, 1
  status: string; // e.g. "20%"
  dueDate: string;
  feedback?: string; // New field for meeting comments
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  category: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed';
  notes: string;
  tasks: Task[];
  createdAt?: string;
  updatedAt?: string;
}

export interface TeamStats {
  totalProjects: number;
  avgProgress: number;
  healthDistribution: {
    healthy: number;
    warning: number;
    risk: number;
  };
}
