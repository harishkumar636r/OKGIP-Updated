# OKGIP - REST API & Architecture Documentation

## Architecture Overview

OKGIP (Organizational Knowledge Gap & Intelligence Platform) is an enterprise-grade full-stack platform designed to identify, analyze, and bridge skill gaps across organizational teams.

```
+-------------------------------------------------------------+
|               React 19 + Vite + Tailwind CSS               |
|                  (Single Page Application)                  |
+------------------------------+------------------------------+
                               |
                        HTTP / REST APIs
                               |
+------------------------------v------------------------------+
|                Spring Boot 3.2 REST Service                 |
|             (Java 17 / Spring Security / JWT)               |
+------------------------------+------------------------------+
                               |
                          JPA / Hibernate
                               |
+------------------------------v------------------------------+
|                MySQL Database (Aiven Cloud / Local)          |
|                   Database Name: okgip_db                   |
+-------------------------------------------------------------+
```

## Backend Services (`springboot-backend/`)

### 1. Authentication Controller (`/api/auth`)
- `POST /api/auth/login` - Authenticate user and issue JWT token.
- `POST /api/auth/register` - Create new employee user account.

### 2. Employee Controller (`/api/employees`)
- `GET /api/employees` - Retrieve all registered employees.
- `GET /api/employees/{id}` - Get specific employee details.
- `GET /api/employees/department/{departmentId}` - Filter employees by department.

### 3. Task Controller (`/api/tasks`)
- `GET /api/tasks/assigned/{employeeId}` - Fetch tasks assigned to an employee.
- `POST /api/tasks` - Assign a new task.
- `PUT /api/tasks/{id}/status` - Update task status (PENDING, WORKING, COMPLETED, LATE).

### 4. Leave Request Controller (`/api/leave`)
- `GET /api/leave` - Fetch all leave requests.
- `GET /api/leave/employee/{employeeId}` - Get leave requests for a specific employee.
- `POST /api/leave/apply` - Submit a new leave application.
- `PUT /api/leave/{id}/status` - Approve or reject leave request.

### 5. AI & Predictive Intelligence Controller (`/api/ai`)
- `GET /api/ai/recommendations/{employeeId}` - AI-driven personalized training suggestions.
- `GET /api/ai/predictive-gap/{departmentId}` - Predictive analysis for future department skill shortages.
- `GET /api/ai/career-path/{employeeId}` - Dynamic AI career progression path.
- `POST /api/ai/chatbot` - AI Assistant chat query handler.

---

## Database ER Schema (`okgip_db`)

The database consists of **17 primary tables**:
1. `users` - User credentials and authentication.
2. `roles` - System roles (`ROLE_ADMIN`, `ROLE_MANAGER`, `ROLE_EMPLOYEE`).
3. `employees` - Employee profile details and department relationships.
4. `departments` - Organizational departments.
5. `skills` - Skill repository.
6. `employee_skills` - Employee skill ratings and proficiency levels.
7. `knowledge_gaps` - Identified gaps between current and required skills.
8. `courses` - Available training courses.
9. `course_progress` - Employee course enrollments, completion %, and test scores.
10. `tasks` - Employee task allocations and deadlines.
11. `leave_requests` - Casual/Medical leave submissions and approvals.
12. `messages` - Internal messaging and broadcast announcements.
13. `notifications` - User alerts and notifications.
14. `badges` - Gamification badges and achievements.
15. `certificates` - Verified course completions and certificates.
16. `ai_recommendations` - Recorded AI intelligence recommendations.
17. `audit_logs` - Security audit trail logs.
