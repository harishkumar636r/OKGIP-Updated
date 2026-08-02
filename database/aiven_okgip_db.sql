-- =========================================================
-- OKGIP (Organizational Knowledge Gap & Intelligence Platform)
-- Schema & Seed Data for Aiven Cloud MySQL Database
-- Host: mysql-1d245307-harishkumar636r-d0ff.d.aivencloud.com:24703
-- User: avnadmin
-- Database: defaultdb
-- =========================================================

USE defaultdb;

-- 1. ROLES
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. USERS
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'ROLE_EMPLOYEE',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. DEPARTMENTS
CREATE TABLE IF NOT EXISTS departments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(20),
    description TEXT,
    manager_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. EMPLOYEES
CREATE TABLE IF NOT EXISTS employees (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    department_id BIGINT,
    designation VARCHAR(100),
    experience_years INT DEFAULT 0,
    avatar_url TEXT,
    performance_score DOUBLE DEFAULT 0.0,
    casual_leave_balance INT DEFAULT 12,
    medical_leave_balance INT DEFAULT 10,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. SKILLS
CREATE TABLE IF NOT EXISTS skills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(100),
    description TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. EMPLOYEE_SKILLS (Junction)
CREATE TABLE IF NOT EXISTS employee_skills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    skill_id BIGINT NOT NULL,
    proficiency_level INT DEFAULT 1,
    last_assessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. KNOWLEDGE_GAPS
CREATE TABLE IF NOT EXISTS knowledge_gaps (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    skill_id BIGINT NOT NULL,
    current_level INT NOT NULL,
    required_level INT NOT NULL,
    priority VARCHAR(20) DEFAULT 'MEDIUM',
    status VARCHAR(50) DEFAULT 'IDENTIFIED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. COURSES
CREATE TABLE IF NOT EXISTS courses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    target_skill_id BIGINT,
    category VARCHAR(100),
    duration_hours INT DEFAULT 1,
    provider VARCHAR(100),
    level VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (target_skill_id) REFERENCES skills(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. COURSE_PROGRESS
CREATE TABLE IF NOT EXISTS course_progress (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    completion_percentage INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'NOT_STARTED',
    quiz_score INT,
    assigned_by BIGINT,
    deadline DATE,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. TASKS
CREATE TABLE IF NOT EXISTS tasks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assigned_to BIGINT NOT NULL,
    assigned_by BIGINT NOT NULL,
    priority VARCHAR(20) DEFAULT 'MEDIUM',
    status VARCHAR(50) DEFAULT 'PENDING',
    deadline DATE,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_to) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES employees(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. LEAVE_REQUESTS
CREATE TABLE IF NOT EXISTS leave_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    leave_type VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    status VARCHAR(50) DEFAULT 'PENDING',
    approved_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 12. MESSAGES
CREATE TABLE IF NOT EXISTS messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sender_id BIGINT NOT NULL,
    recipient_id BIGINT,
    is_announcement BOOLEAN DEFAULT FALSE,
    content TEXT NOT NULL,
    attachment_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (recipient_id) REFERENCES employees(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 13. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'SYSTEM',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 14. BADGES
CREATE TABLE IF NOT EXISTS badges (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(100),
    description TEXT,
    category VARCHAR(100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 15. CERTIFICATES
CREATE TABLE IF NOT EXISTS certificates (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    certificate_number VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    provider VARCHAR(100),
    issue_date DATE,
    certificate_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 16. AI_RECOMMENDATIONS
CREATE TABLE IF NOT EXISTS ai_recommendations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    recommendation_type VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 17. AUDIT_LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_email VARCHAR(255),
    action VARCHAR(100),
    resource VARCHAR(100),
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- SEED INITIAL DATA
INSERT INTO roles (id, name) VALUES (1, 'ROLE_ADMIN'), (2, 'ROLE_MANAGER'), (3, 'ROLE_EMPLOYEE') ON DUPLICATE KEY UPDATE name=name;

INSERT INTO users (id, email, password_hash, role) VALUES
(1, 'admin@okgip.com', '$2a$10$e7x1LgK9dG3f9e.S8Z0J..A.gG7Y43mS', 'ROLE_ADMIN'),
(2, 'manager@okgip.com', '$2a$10$e7x1LgK9dG3f9e.S8Z0J..A.gG7Y43mS', 'ROLE_MANAGER'),
(3, 'employee@okgip.com', '$2a$10$e7x1LgK9dG3f9e.S8Z0J..A.gG7Y43mS', 'ROLE_EMPLOYEE')
ON DUPLICATE KEY UPDATE email=email;

INSERT INTO departments (id, name, code, description) VALUES
(1, 'Software Engineering', 'ENG', 'Full Stack Development and Cloud Infrastructure'),
(2, 'Data & AI', 'AI', 'Machine Learning, Predictive Analytics & BI'),
(3, 'Human Resources', 'HR', 'Talent acquisition, employee wellness, and corporate learning')
ON DUPLICATE KEY UPDATE name=name;

INSERT INTO employees (id, user_id, first_name, last_name, department_id, designation, experience_years, performance_score) VALUES
(1, 1, 'System', 'Administrator', 1, 'Chief Technical Administrator', 10, 98.5),
(2, 2, 'Sarah', 'Jenkins', 1, 'Engineering Manager', 7, 94.0),
(3, 3, 'Alex', 'Rivera', 1, 'Senior Frontend Engineer', 4, 88.0)
ON DUPLICATE KEY UPDATE first_name=first_name;

INSERT INTO skills (id, name, category, description) VALUES
(1, 'React', 'Frontend', 'Modern web interfaces and component architecture'),
(2, 'Spring Boot', 'Backend', 'Java enterprise REST microservices'),
(3, 'Docker', 'DevOps', 'Containerization and environment portability'),
(4, 'Kubernetes', 'Cloud', 'Container orchestration and cluster management'),
(5, 'MySQL', 'Database', 'Relational database query optimization and schema design')
ON DUPLICATE KEY UPDATE name=name;
