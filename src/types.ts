export type ProjectType = 'hotel' | 'office';
export type TaskStatus = 'pending' | 'in-progress' | 'review' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type TaskPhase = 'assessment' | 'planning' | 'renovation' | 'procurement' | 'staffing' | 'handover';

export interface Project {
  id: string;
  name: string;
  type: ProjectType;
  description: string;
  manager: string;
  targetDate: string;
}

export interface Note {
  id: string;
  text: string;
  timestamp: string;
  author?: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  phase: TaskPhase;
  dueDate: string;
  assignee: string;
  isChecklistItem?: boolean;
  dependencies?: string[];
  notesList?: Note[];
}

export interface AssessmentMetric {
  id: string;
  projectId: string;
  category: string;
  item: string;
  status: 'pass' | 'fail' | 'pending' | 'n/a';
  notes: string;
  notesList?: Note[];
  vendor?: string;
}

export interface AuditLog {
  id: string;
  projectId: string;
  action: string;
  details: string;
  timestamp: string;
  user: string;
}
