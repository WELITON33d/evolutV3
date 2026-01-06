
export enum ProjectType {
  SAAS = 'SaaS',
  PHYSICAL = 'Produto Físico',
  SERVICE = 'Serviço',
  OTHER = 'Outro'
}

export enum ProjectStatus {
  NOT_STARTED = 'Não Iniciado',
  IN_PROGRESS = 'Em Andamento',
  COMPLETED = 'Concluído',
  ON_HOLD = 'Em Espera'
}

export enum Level {
  LOW = 'Baixa',
  MEDIUM = 'Média',
  HIGH = 'Alta'
}

export enum TaskPriority {
  LOW = 'Baixa',
  MEDIUM = 'Média',
  HIGH = 'Alta',
  URGENT = 'Urgente'
}

export enum TaskStatus {
  TODO = 'A Fazer',
  IN_PROGRESS = 'Em Andamento',
  REVIEW = 'Revisão',
  DONE = 'Concluído'
}

export enum BlockType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  LINK = 'LINK',
  FILE = 'FILE',
  TODO = 'TODO',
  REMINDER = 'REMINDER'
}

export interface StrategicFields {
  mainPain: string;
  targetAudience: string;
  urgency: Level;
  complexity: Level;
  scalePotential: string;
  risks: string;
}

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  metadata?: {
    url?: string;
    fileName?: string;
    fileType?: string;
    fileSize?: number;
    completed?: boolean;
    dueDate?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    assignee?: string;
  };
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  type: ProjectType;
  description: string;
  strategicFields: StrategicFields;
  tags: string[];
  blocks: Block[];
  status: ProjectStatus;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

export interface Reminder {
  id: string;
  projectId: string;
  projectName: string;
  text: string;
  date: string;
  completed: boolean;
}
