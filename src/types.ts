export type UserRole = 'Admin' | 'Manager' | 'Employee';

export interface User {
  id: number;
  email: string;
  role: UserRole;
  employee?: Employee | null;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  description: string;
  head_employee_id: number | null;
  head_name?: string;
  employee_count?: number;
  active_gaps_count?: number;
  high_priority_gaps?: number;
  required_skills?: Array<{
    id: number;
    skill_id: number;
    required_proficiency: number;
    skill_name?: string;
    category?: string;
  }>;
}

export interface Employee {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  designation: string;
  department_id: number | null;
  department_name?: string;
  join_date: string;
  photo_url: string | null;
  status: 'Active' | 'On Leave' | 'Terminated';
  skills_count?: number;
  gaps_count?: number;
  high_gaps_count?: number;
}

export interface Skill {
  id: number;
  name: string;
  category: 'Technical' | 'Soft Skills' | 'Leadership' | 'Domain Knowledge' | 'Compliance';
  description: string;
  assessed_employees_count?: number;
  required_in_departments?: string[];
  gap_count?: number;
  high_priority_gaps?: number;
}

export interface EmployeeSkill {
  id: number;
  employee_id: number;
  skill_id: number;
  current_proficiency: number;
  assessed_date: string;
  verified_by: string;
  skill?: Skill;
  skill_name?: string;
  category?: string;
}

export interface KnowledgeGap {
  id: number;
  employee_id: number;
  employee_name: string;
  employee_designation?: string;
  employee_photo?: string | null;
  department_name: string;
  skill_id: number;
  skill_name: string;
  skill_category: string;
  required_proficiency: number;
  current_proficiency: number;
  gap_score: number;
  competency_percentage: number;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Identified' | 'In Training' | 'Resolved';
  created_at: string;
  recommended_training?: {
    id: number;
    title: string;
    duration_hours: number;
    provider: string;
  } | null;
}

export interface TrainingProgram {
  id: number;
  title: string;
  description: string;
  category: string;
  target_skill_id: number;
  target_skill_name?: string;
  min_proficiency_gain: number;
  duration_hours: number;
  provider: string;
  status: 'Active' | 'Draft' | 'Archived';
  total_enrolled?: number;
  completed_count?: number;
  completion_rate?: number;
}

export interface TrainingAssignment {
  id: number;
  training_program_id: number;
  program_title: string;
  program_category: string;
  duration_hours: number;
  employee_id: number;
  employee_name: string;
  employee_email: string;
  department_name: string;
  target_skill_name: string;
  assigned_date: string;
  due_date: string;
  status: 'Assigned' | 'In Progress' | 'Completed' | 'Overdue';
  progress_percentage: number;
  certificate_url?: string | null;
  completed_at?: string | null;
}

export interface NotificationItem {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'Gap Alert' | 'Training Assigned' | 'Skill Verified' | 'System';
  is_read: boolean;
  created_at: string;
}

export interface AnalyticsData {
  metrics: {
    totalEmployees: number;
    totalDepartments: number;
    totalSkills: number;
    totalGaps: number;
    highPriorityGaps: number;
    mediumPriorityGaps: number;
    lowPriorityGaps: number;
    inTrainingCount: number;
    avgGapScore: number;
  };
  departmentBreakdown: Array<{
    department_id: number;
    department_name: string;
    total_gaps: number;
    high_gaps: number;
  }>;
  skillDeficiencies: Array<{
    skill_id: number;
    skill_name: string;
    category: string;
    gap_count: number;
    avg_deficit: number;
  }>;
}
