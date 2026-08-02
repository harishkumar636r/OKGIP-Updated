-- =========================================================
-- OKGIP (Organizational Knowledge Gap & Intelligence Platform)
-- Database Schema for MySQL / Aiven Cloud MySQL
-- Database Name: okgip_db
-- =========================================================

CREATE DATABASE IF NOT EXISTS okgip_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE okgip_db;

-- 1. ROLES
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- 2. USERS
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'ROLE_EMPLOYEE',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. DEPARTMENTS
CREATE TABLE IF NOT EXISTS departments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(20),
    description TEXT,
    manager_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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
);

-- 5. SKILLS
CREATE TABLE IF NOT EXISTS skills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(100),
    description TEXT
);

-- 6. EMPLOYEE_SKILLS (Junction)
CREATE TABLE IF NOT EXISTS employee_skills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    skill_id BIGINT NOT NULL,
    proficiency_level INT DEFAULT 1, -- 1 to 5
    last_assessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

-- 7. KNOWLEDGE_GAPS
CREATE TABLE IF NOT EXISTS knowledge_gaps (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    skill_id BIGINT NOT NULL,
    current_level INT NOT NULL,
    required_level INT NOT NULL,
    priority VARCHAR(20) DEFAULT 'MEDIUM', -- HIGH, MEDIUM, LOW
    status VARCHAR(50) DEFAULT 'IDENTIFIED', -- IDENTIFIED, IN_TRAINING, RESOLVED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

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
);

-- 9. COURSE_PROGRESS
CREATE TABLE IF NOT EXISTS course_progress (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    completion_percentage INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'NOT_STARTED', -- NOT_STARTED, IN_PROGRESS, COMPLETED
    quiz_score INT,
    assigned_by BIGINT,
    deadline DATE,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- 10. TASKS
CREATE TABLE IF NOT EXISTS tasks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assigned_to BIGINT NOT NULL,
    assigned_by BIGINT NOT NULL,
    priority VARCHAR(20) DEFAULT 'MEDIUM',
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, WORKING, COMPLETED, LATE
    deadline DATE,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_to) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES employees(id) ON DELETE CASCADE
);

-- 11. LEAVE_REQUESTS
CREATE TABLE IF NOT EXISTS leave_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    leave_type VARCHAR(50) NOT NULL, -- Casual, Medical, Vacation, Emergency
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    approved_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- 12. MESSAGES
CREATE TABLE IF NOT EXISTS messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sender_id BIGINT NOT NULL,
    recipient_id BIGINT, -- NULL for company-wide announcements
    is_announcement BOOLEAN DEFAULT FALSE,
    content TEXT NOT NULL,
    attachment_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (recipient_id) REFERENCES employees(id) ON DELETE CASCADE
);

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
);

-- 14. BADGES
CREATE TABLE IF NOT EXISTS badges (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(100),
    description TEXT,
    category VARCHAR(100)
);

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
);

-- 16. AI_RECOMMENDATIONS
CREATE TABLE IF NOT EXISTS ai_recommendations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    recommendation_type VARCHAR(50) NOT NULL, -- TRAINING, CAREER, PREDICTIVE_GAP
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- 17. AUDIT_LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_email VARCHAR(255),
    action VARCHAR(100),
    resource VARCHAR(100),
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
