-- =========================================================
-- OKGIP Seed Data SQL Script
-- Database Name: okgip_db
-- =========================================================

USE okgip_db;

-- Insert Roles
INSERT INTO roles (id, name) VALUES (1, 'ROLE_ADMIN'), (2, 'ROLE_MANAGER'), (3, 'ROLE_EMPLOYEE') ON DUPLICATE KEY UPDATE name=name;

-- Insert Users
INSERT INTO users (id, email, password_hash, role) VALUES
(1, 'admin@okgip.com', '$2a$10$e7x1LgK9dG3f9e.S8Z0J..A.gG7Y43mS', 'ROLE_ADMIN'),
(2, 'manager@okgip.com', '$2a$10$e7x1LgK9dG3f9e.S8Z0J..A.gG7Y43mS', 'ROLE_MANAGER'),
(3, 'employee@okgip.com', '$2a$10$e7x1LgK9dG3f9e.S8Z0J..A.gG7Y43mS', 'ROLE_EMPLOYEE')
ON DUPLICATE KEY UPDATE email=email;

-- Insert Departments
INSERT INTO departments (id, name, code, description) VALUES
(1, 'Software Engineering', 'ENG', 'Full Stack Development and Cloud Infrastructure'),
(2, 'Data & AI', 'AI', 'Machine Learning, Predictive Analytics & BI'),
(3, 'Human Resources', 'HR', 'Talent acquisition, employee wellness, and corporate learning')
ON DUPLICATE KEY UPDATE name=name;

-- Insert Employees
INSERT INTO employees (id, user_id, first_name, last_name, department_id, designation, experience_years, performance_score) VALUES
(1, 1, 'System', 'Administrator', 1, 'Chief Technical Administrator', 10, 98.5),
(2, 2, 'Sarah', 'Jenkins', 1, 'Engineering Manager', 7, 94.0),
(3, 3, 'Alex', 'Rivera', 1, 'Senior Frontend Engineer', 4, 88.0)
ON DUPLICATE KEY UPDATE first_name=first_name;

-- Insert Skills
INSERT INTO skills (id, name, category, description) VALUES
(1, 'React', 'Frontend', 'Modern web interfaces and component architecture'),
(2, 'Spring Boot', 'Backend', 'Java enterprise REST microservices'),
(3, 'Docker', 'DevOps', 'Containerization and environment portability'),
(4, 'Kubernetes', 'Cloud', 'Container orchestration and cluster management'),
(5, 'MySQL', 'Database', 'Relational database query optimization and schema design')
ON DUPLICATE KEY UPDATE name=name;

-- Insert Knowledge Gaps
INSERT INTO knowledge_gaps (id, employee_id, skill_id, current_level, required_level, priority, status) VALUES
(1, 3, 3, 2, 4, 'HIGH', 'IN_TRAINING'),
(2, 3, 4, 1, 3, 'HIGH', 'IDENTIFIED')
ON DUPLICATE KEY UPDATE id=id;

-- Insert Courses
INSERT INTO courses (id, title, description, target_skill_id, category, duration_hours, provider, level) VALUES
(1, 'Docker Containerization Essentials', 'Master Docker containers, compose, and multi-stage builds', 3, 'DevOps', 8, 'Coursera', 'Intermediate'),
(2, 'Kubernetes Basics for Developers', 'Deploy and manage microservices on Kubernetes clusters', 4, 'Cloud Native', 12, 'Udemy', 'Advanced')
ON DUPLICATE KEY UPDATE title=title;
