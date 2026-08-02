import bcrypt from 'bcryptjs';

export interface User {
  id: number;
  email: string;
  password_hash: string;
  role: 'Admin' | 'Manager' | 'Employee';
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  description: string;
  head_employee_id: number | null;
  created_at: string;
  updated_at: string;
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
  join_date: string;
  photo_url: string | null;
  status: 'Active' | 'On Leave' | 'Terminated';
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: number;
  name: string;
  category: 'Technical' | 'Soft Skills' | 'Leadership' | 'Domain Knowledge' | 'Compliance';
  description: string;
  created_at: string;
  updated_at: string;
}

export interface DepartmentRequiredSkill {
  id: number;
  department_id: number;
  skill_id: number;
  required_proficiency: number;
}

export interface EmployeeSkill {
  id: number;
  employee_id: number;
  skill_id: number;
  current_proficiency: number;
  assessed_date: string;
  verified_by: string;
  created_at: string;
}

export interface KnowledgeGap {
  id: number;
  employee_id: number;
  skill_id: number;
  required_proficiency: number;
  current_proficiency: number;
  gap_score: number;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Identified' | 'In Training' | 'Resolved';
  created_at: string;
  updated_at: string;
}

export interface TrainingProgram {
  id: number;
  title: string;
  description: string;
  category: string;
  target_skill_id: number;
  min_proficiency_gain: number;
  duration_hours: number;
  provider: string;
  status: 'Active' | 'Draft' | 'Archived';
  created_at: string;
}

export interface TrainingAssignment {
  id: number;
  training_program_id: number;
  employee_id: number;
  assigned_by: number | null;
  assigned_date: string;
  due_date: string;
  status: 'Assigned' | 'In Progress' | 'Completed' | 'Overdue';
  progress_percentage: number;
  certificate_url: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'Gap Alert' | 'Training Assigned' | 'Skill Verified' | 'Leave Approved' | 'Task Assigned' | 'Certificate Earned' | 'Manager Message' | 'System';
  is_read: boolean;
  created_at: string;
}

export interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  sender_name: string;
  receiver_name: string;
  subject: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface LeaveRequest {
  id: number;
  employee_id: number;
  employee_name: string;
  department_name: string;
  leave_type: 'Annual' | 'Sick' | 'Casual' | 'Maternity/Paternity' | 'Study';
  start_date: string;
  end_date: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  approved_by?: string;
  created_at: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  assigned_by: number;
  assigned_by_name: string;
  employee_id: number;
  employee_name: string;
  due_date: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'In Progress' | 'Completed' | 'Overdue';
  progress_percentage: number;
  created_at: string;
}

export interface Badge {
  id: number;
  employee_id: number;
  badge_type: 'Fast Learner' | 'Top Performer' | 'Knowledge Expert' | 'Cloud Champion' | 'AI Specialist' | 'Team Mentor' | 'Training Master' | 'Innovation Award';
  description: string;
  icon: string;
  awarded_at: string;
}

export interface Certificate {
  id: number;
  employee_id: number;
  employee_name: string;
  training_assignment_id: number;
  program_title: string;
  cert_number: string;
  issued_date: string;
  verification_code: string;
}

export interface AuditLog {
  id: number;
  user_id: number;
  user_email: string;
  user_role: string;
  action: string;
  entity: string;
  details: string;
  ip_address: string;
  created_at: string;
}

export interface AssessmentQuestion {
  id: number;
  question: string;
  options: string[];
  correct_index: number;
}

export interface SkillAssessment {
  id: number;
  skill_id: number;
  skill_name: string;
  title: string;
  description: string;
  pass_score: number;
  questions: AssessmentQuestion[];
}

export interface AssessmentResult {
  id: number;
  employee_id: number;
  assessment_id: number;
  skill_id: number;
  score: number;
  passed: boolean;
  new_proficiency_level: number;
  taken_at: string;
}

class OKGIPDatabase {
  users: User[] = [];
  departments: Department[] = [];
  employees: Employee[] = [];
  skills: Skill[] = [];
  departmentRequiredSkills: DepartmentRequiredSkill[] = [];
  employeeSkills: EmployeeSkill[] = [];
  knowledgeGaps: KnowledgeGap[] = [];
  trainingPrograms: TrainingProgram[] = [];
  trainingAssignments: TrainingAssignment[] = [];
  notifications: Notification[] = [];
  messages: Message[] = [];
  leaveRequests: LeaveRequest[] = [];
  tasks: Task[] = [];
  badges: Badge[] = [];
  certificates: Certificate[] = [];
  auditLogs: AuditLog[] = [];
  assessments: SkillAssessment[] = [];
  assessmentResults: AssessmentResult[] = [];

  constructor() {
    this.seedData();
  }

  private seedData() {
    const defaultPassword = bcrypt.hashSync('Password123!', 10);
    const now = new Date().toISOString();

    // 1. Users
    this.users = [
      { id: 1, email: 'admin@okgip.org', password_hash: defaultPassword, role: 'Admin', created_at: now, updated_at: now },
      { id: 2, email: 'manager.tech@okgip.org', password_hash: defaultPassword, role: 'Manager', created_at: now, updated_at: now },
      { id: 3, email: 'alex.morgan@okgip.org', password_hash: defaultPassword, role: 'Employee', created_at: now, updated_at: now },
      { id: 4, email: 'sarah.chen@okgip.org', password_hash: defaultPassword, role: 'Employee', created_at: now, updated_at: now },
      { id: 5, email: 'david.kumar@okgip.org', password_hash: defaultPassword, role: 'Manager', created_at: now, updated_at: now },
    ];

    // 2. Departments
    this.departments = [
      { id: 1, name: 'Software Engineering', code: 'ENG', description: 'Core software architecture, cloud platforms, and application development.', head_employee_id: 2, created_at: now, updated_at: now },
      { id: 2, name: 'Data Science & Analytics', code: 'DSA', description: 'Machine learning models, business intelligence, and data pipeline management.', head_employee_id: 4, created_at: now, updated_at: now },
      { id: 3, name: 'Cybersecurity & Compliance', code: 'SEC', description: 'Information security, vulnerability management, and ISO compliance.', head_employee_id: 5, created_at: now, updated_at: now },
      { id: 4, name: 'Product Management', code: 'PRD', description: 'Product strategy, customer roadmap, and cross-functional feature planning.', head_employee_id: null, created_at: now, updated_at: now },
    ];

    // 3. Employees
    this.employees = [
      { id: 1, user_id: 1, first_name: 'System', last_name: 'Administrator', email: 'admin@okgip.org', phone: '+1-800-555-0100', designation: 'Chief Technology Officer', department_id: 1, join_date: '2023-01-15', photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', status: 'Active', created_at: now, updated_at: now },
      { id: 2, user_id: 2, first_name: 'Robert', last_name: 'Vance', email: 'manager.tech@okgip.org', phone: '+1-800-555-0102', designation: 'VP of Engineering', department_id: 1, join_date: '2023-03-01', photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', status: 'Active', created_at: now, updated_at: now },
      { id: 3, user_id: 3, first_name: 'Alex', last_name: 'Morgan', email: 'alex.morgan@okgip.org', phone: '+1-800-555-0103', designation: 'Senior Full Stack Developer', department_id: 1, join_date: '2023-06-10', photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', status: 'Active', created_at: now, updated_at: now },
      { id: 4, user_id: 4, first_name: 'Sarah', last_name: 'Chen', email: 'sarah.chen@okgip.org', phone: '+1-800-555-0104', designation: 'Data Scientist Lead', department_id: 2, join_date: '2023-08-20', photo_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', status: 'Active', created_at: now, updated_at: now },
      { id: 5, user_id: 5, first_name: 'David', last_name: 'Kumar', email: 'david.kumar@okgip.org', phone: '+1-800-555-0105', designation: 'Security Audit Lead', department_id: 3, join_date: '2023-04-12', photo_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', status: 'Active', created_at: now, updated_at: now },
    ];

    // 4. Skills
    this.skills = [
      { id: 1, name: 'React & Frontend Architecture', category: 'Technical', description: 'Advanced SPA state management, hooks, and responsive design systems.', created_at: now, updated_at: now },
      { id: 2, name: 'Node.js & Microservices', category: 'Technical', description: 'RESTful API engineering, Express middleware, asynchronous IO, and security.', created_at: now, updated_at: now },
      { id: 3, name: 'Cloud Infrastructure (AWS/GCP)', category: 'Technical', description: 'Containerized deployments, Docker, Kubernetes, and Serverless architectures.', created_at: now, updated_at: now },
      { id: 4, name: 'SQL & Database Optimization', category: 'Technical', description: 'Relational database schema design, indexing, query optimization, and ORM.', created_at: now, updated_at: now },
      { id: 5, name: 'Cybersecurity & Risk Audit', category: 'Compliance', description: 'SOC2 compliance, OWASP Top 10 mitigation, encryption, and threat modeling.', created_at: now, updated_at: now },
      { id: 6, name: 'Agile Team Leadership', category: 'Leadership', description: 'Scrum facilitation, backlog grooming, velocity tracking, and mentoring.', created_at: now, updated_at: now },
    ];

    // 5. Dept Required Skills
    this.departmentRequiredSkills = [
      { id: 1, department_id: 1, skill_id: 1, required_proficiency: 5 },
      { id: 2, department_id: 1, skill_id: 2, required_proficiency: 5 },
      { id: 3, department_id: 1, skill_id: 3, required_proficiency: 4 },
      { id: 4, department_id: 1, skill_id: 4, required_proficiency: 4 },
      { id: 5, department_id: 2, skill_id: 4, required_proficiency: 5 },
      { id: 6, department_id: 2, skill_id: 3, required_proficiency: 4 },
      { id: 7, department_id: 3, skill_id: 5, required_proficiency: 5 },
      { id: 8, department_id: 3, skill_id: 3, required_proficiency: 4 },
    ];

    // 6. Employee Skills
    this.employeeSkills = [
      { id: 1, employee_id: 3, skill_id: 1, current_proficiency: 5, assessed_date: '2026-01-10', verified_by: 'Robert Vance', created_at: now },
      { id: 2, employee_id: 3, skill_id: 2, current_proficiency: 4, assessed_date: '2026-01-10', verified_by: 'Robert Vance', created_at: now },
      { id: 3, employee_id: 3, skill_id: 3, current_proficiency: 2, assessed_date: '2026-01-10', verified_by: 'Robert Vance', created_at: now },
      { id: 4, employee_id: 3, skill_id: 4, current_proficiency: 3, assessed_date: '2026-01-10', verified_by: 'Robert Vance', created_at: now },
      { id: 5, employee_id: 4, skill_id: 4, current_proficiency: 5, assessed_date: '2026-02-15', verified_by: 'David Kumar', created_at: now },
      { id: 6, employee_id: 4, skill_id: 3, current_proficiency: 2, assessed_date: '2026-02-15', verified_by: 'David Kumar', created_at: now },
    ];

    // 7. Knowledge Gaps
    this.recalculateAllGaps();

    // 8. Training Programs
    this.trainingPrograms = [
      { id: 1, title: 'Enterprise Cloud & Docker Mastery', description: 'Comprehensive cloud infrastructure course covering containerization, Kubernetes, and CI/CD pipelines.', category: 'Cloud & DevOps', target_skill_id: 3, min_proficiency_gain: 2, duration_hours: 24, provider: 'Global Tech Institute', status: 'Active', created_at: now },
      { id: 2, title: 'Advanced Database Query Tuning & Scaling', description: 'Deep dive into MySQL indexing, execution plans, partition strategies, and connection pooling.', category: 'Database Systems', target_skill_id: 4, min_proficiency_gain: 1, duration_hours: 16, provider: 'Internal Engineering Academy', status: 'Active', created_at: now },
      { id: 3, title: 'Zero Trust Architecture & Security Operations', description: 'Hands-on training on modern perimeterless defense, OAuth2, and threat response.', category: 'Cybersecurity', target_skill_id: 5, min_proficiency_gain: 2, duration_hours: 30, provider: 'SecureCert Labs', status: 'Active', created_at: now },
    ];

    // 9. Training Assignments
    this.trainingAssignments = [
      { id: 1, training_program_id: 1, employee_id: 3, assigned_by: 1, assigned_date: '2026-03-01', due_date: '2026-08-30', status: 'In Progress', progress_percentage: 65, certificate_url: null, completed_at: null, created_at: now, updated_at: now },
      { id: 2, training_program_id: 2, employee_id: 3, assigned_by: 1, assigned_date: '2026-03-05', due_date: '2026-09-15', status: 'Assigned', progress_percentage: 0, certificate_url: null, completed_at: null, created_at: now, updated_at: now },
      { id: 3, training_program_id: 1, employee_id: 4, assigned_by: 2, assigned_date: '2026-03-10', due_date: '2026-08-25', status: 'In Progress', progress_percentage: 40, certificate_url: null, completed_at: null, created_at: now, updated_at: now },
    ];

    // 10. Notifications
    this.notifications = [
      { id: 1, user_id: 3, title: 'Training Assigned', message: 'You have been enrolled in Enterprise Cloud & Docker Mastery due date Aug 30, 2026.', type: 'Training Assigned', is_read: false, created_at: now },
      { id: 2, user_id: 3, title: 'Knowledge Gap Identified', message: 'A high priority gap in Cloud Infrastructure (AWS/GCP) was detected on your competency assessment.', type: 'Gap Alert', is_read: false, created_at: now },
      { id: 3, user_id: 1, title: 'System Health Normal', message: 'Weekly knowledge gap intelligence sync completed with 3 active training assignments.', type: 'System', is_read: true, created_at: now },
    ];

    // 11. Messages
    this.messages = [
      {
        id: 1,
        sender_id: 2,
        receiver_id: 3,
        sender_name: 'Robert Vance (Manager)',
        receiver_name: 'Alex Morgan',
        subject: 'Q3 Upskilling Goal & Cloud Certification',
        content: 'Hi Alex, please complete the assigned Docker Mastery course by end of August so we can qualify for the GCP Premier tier.',
        is_read: false,
        created_at: now,
      },
      {
        id: 2,
        sender_id: 3,
        receiver_id: 2,
        sender_name: 'Alex Morgan',
        receiver_name: 'Robert Vance (Manager)',
        subject: 'RE: Q3 Upskilling Goal & Cloud Certification',
        content: 'Thanks Robert, I have completed 65% of the coursework. Will submit the assessment this Friday.',
        is_read: true,
        created_at: now,
      },
    ];

    // 12. Leave Requests
    this.leaveRequests = [
      {
        id: 1,
        employee_id: 3,
        employee_name: 'Alex Morgan',
        department_name: 'Software Engineering',
        leave_type: 'Annual',
        start_date: '2026-08-15',
        end_date: '2026-08-20',
        reason: 'Annual family vacation',
        status: 'Approved',
        approved_by: 'Robert Vance',
        created_at: now,
      },
      {
        id: 2,
        employee_id: 4,
        employee_name: 'Sarah Chen',
        department_name: 'Data Science & Analytics',
        leave_type: 'Study',
        start_date: '2026-09-01',
        end_date: '2026-09-05',
        reason: 'Attending AI & Big Data Summit',
        status: 'Pending',
        created_at: now,
      },
    ];

    // 13. Tasks
    this.tasks = [
      {
        id: 1,
        title: 'Kubernetes Cluster Architecture Upgrade',
        description: 'Implement Helm chart deployment templates for microservices.',
        assigned_by: 2,
        assigned_by_name: 'Robert Vance',
        employee_id: 3,
        employee_name: 'Alex Morgan',
        due_date: '2026-08-25',
        priority: 'High',
        status: 'In Progress',
        progress_percentage: 70,
        created_at: now,
      },
      {
        id: 2,
        title: 'Complete SOC2 Security Risk Audit Checklist',
        description: 'Verify encrypted payload transmission and JWT expiration thresholds.',
        assigned_by: 5,
        assigned_by_name: 'David Kumar',
        employee_id: 3,
        employee_name: 'Alex Morgan',
        due_date: '2026-08-18',
        priority: 'Medium',
        status: 'Pending',
        progress_percentage: 20,
        created_at: now,
      },
    ];

    // 14. Badges
    this.badges = [
      { id: 1, employee_id: 3, badge_type: 'Fast Learner', description: 'Completed 2 training modules in under 14 days.', icon: 'Zap', awarded_at: '2026-02-10' },
      { id: 2, employee_id: 3, badge_type: 'Cloud Champion', description: 'Passed AWS & Docker Architecture certification.', icon: 'Cloud', awarded_at: '2026-03-01' },
      { id: 3, employee_id: 4, badge_type: 'Top Performer', description: 'Maintained 100% competency score in Data Engineering.', icon: 'Award', awarded_at: '2026-02-28' },
      { id: 4, employee_id: 5, badge_type: 'Knowledge Expert', description: 'Verified over 15 team skills in Security & Compliance.', icon: 'Shield', awarded_at: '2026-01-15' },
    ];

    // 15. Certificates
    this.certificates = [
      {
        id: 1,
        employee_id: 3,
        employee_name: 'Alex Morgan',
        training_assignment_id: 1,
        program_title: 'Enterprise Cloud & Docker Mastery',
        cert_number: 'OKGIP-CERT-2026-88392',
        issued_date: '2026-03-01',
        verification_code: 'VER-88392-CLOUD',
      },
    ];

    // 16. Audit Logs
    this.auditLogs = [
      { id: 1, user_id: 1, user_email: 'admin@okgip.org', user_role: 'Admin', action: 'LOGIN', entity: 'AUTH', details: 'Admin logged into OKGIP Portal', ip_address: '192.168.1.10', created_at: now },
      { id: 2, user_id: 2, user_email: 'manager.tech@okgip.org', user_role: 'Manager', action: 'ASSIGN_TRAINING', entity: 'TRAINING', details: 'Assigned Enterprise Cloud Mastery to Alex Morgan', ip_address: '192.168.1.14', created_at: now },
    ];

    // 17. Skill Assessments
    this.assessments = [
      {
        id: 1,
        skill_id: 3,
        skill_name: 'Cloud Infrastructure (AWS/GCP)',
        title: 'Cloud Infrastructure & Kubernetes Proficiency Exam',
        description: 'Test your knowledge on Docker containers, Kubernetes pods, Helm, and AWS IAM.',
        pass_score: 75,
        questions: [
          {
            id: 1,
            question: 'Which tool is used to manage multi-container Docker applications via a single configuration file?',
            options: ['Docker Compose', 'Kubernetes Ingress', 'AWS CloudFormation', 'Terraform'],
            correct_index: 0,
          },
          {
            id: 2,
            question: 'What is the smallest deployable computing unit in Kubernetes?',
            options: ['Container', 'Pod', 'Service', 'Node'],
            correct_index: 1,
          },
          {
            id: 3,
            question: 'Which cloud security mechanism ensures principle of least privilege for cloud services?',
            options: ['VPC Peering', 'IAM Policies & Roles', 'Security Groups', 'S3 Bucket Policies'],
            correct_index: 1,
          },
        ],
      },
      {
        id: 2,
        skill_id: 4,
        skill_name: 'SQL & Database Optimization',
        title: 'Relational Database Optimization & Indexing Assessment',
        description: 'Assess query execution plans, B-Tree indexes, composite keys, and transaction isolation levels.',
        pass_score: 70,
        questions: [
          {
            id: 1,
            question: 'Which index structure is most commonly used in relational databases for range queries?',
            options: ['Hash Index', 'B-Tree Index', 'Bitmap Index', 'Spatial Index'],
            correct_index: 1,
          },
          {
            id: 2,
            question: 'What SQL command is used to analyze execution plans in MySQL/PostgreSQL?',
            options: ['DESCRIBE', 'EXPLAIN', 'ANALYZE QUERY', 'SHOW INDEX'],
            correct_index: 1,
          },
        ],
      },
    ];
  }

  public recalculateAllGaps() {
    this.knowledgeGaps = [];
    let gapId = 1;
    const now = new Date().toISOString();

    for (const emp of this.employees) {
      if (!emp.department_id) continue;
      const deptReqs = this.departmentRequiredSkills.filter(r => r.department_id === emp.department_id);

      for (const req of deptReqs) {
        const empSkill = this.employeeSkills.find(s => s.employee_id === emp.id && s.skill_id === req.skill_id);
        const currentProf = empSkill ? empSkill.current_proficiency : 0;
        const gapScore = req.required_proficiency - currentProf;

        if (gapScore > 0) {
          let priority: 'High' | 'Medium' | 'Low' = 'Low';
          if (gapScore >= 2) priority = 'High';
          else if (gapScore === 1) priority = 'Medium';

          // Check if currently assigned in active training
          const assignment = this.trainingAssignments.find(ta => {
            const tp = this.trainingPrograms.find(p => p.id === ta.training_program_id);
            return ta.employee_id === emp.id && tp?.target_skill_id === req.skill_id && (ta.status === 'In Progress' || ta.status === 'Assigned');
          });

          const status = assignment ? 'In Training' : 'Identified';

          this.knowledgeGaps.push({
            id: gapId++,
            employee_id: emp.id,
            skill_id: req.skill_id,
            required_proficiency: req.required_proficiency,
            current_proficiency: currentProf,
            gap_score: gapScore,
            priority,
            status,
            created_at: now,
            updated_at: now,
          });
        }
      }
    }
  }
}

export const db = new OKGIPDatabase();
