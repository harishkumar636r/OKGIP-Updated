# OKGIP — Organizational Knowledge Gap & Intelligence Platform

OKGIP is an end-to-end enterprise platform designed to identify, visualize, and bridge skill gaps within organizations using AI analytics, interactive dashboards, and real-time learning management.

## Project Links

### GitHub Repository
https://github.com/harishkumar636r/OKGIP-Updated

### Live Demo
https://okgip-updated.onrender.com/

### Technologies Used
- React 19
- Vite
- TypeScript
- Node.js
- Express.js
- Spring Boot (Alternative Backend)
- MySQL (Aiven Cloud)
- JWT Authentication
- Render Deployment

### Quick Access

| Resource | Link |
|----------|------|
| GitHub Repository | https://github.com/harishkumar636r/OKGIP-Updated |
| Live Application | https://okgip-updated.onrender.com/ |
## 📊 Database Architecture (`okgip_db`)

The database runs on **MySQL (Aiven Cloud or local MySQL server)** and includes 17 relational tables:

- `users`
- `roles`
- `employees`
- `departments`
- `skills`
- `employee_skills`
- `knowledge_gaps`
- `courses`
- `course_progress`
- `tasks`
- `leave_requests`
- `messages`
- `notifications`
- `badges`
- `certificates`
- `ai_recommendations`
- `audit_logs`

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide Icons, Recharts, Multi-language context (English, Tamil, Hindi, Spanish, French, German, Chinese)
- **Backend**: Java 17, Spring Boot 3.2.3, Spring Data JPA, Hibernate, JWT Security, Lombok, Maven
- **Database**: MySQL 8.0 (Aiven Cloud supported), H2 (Local memory option)

## 🌐 Multi-Language Support
Supported languages in the application interface:
- English
- தமிழ் (Tamil)
- हिंदी (Hindi)
- Español (Spanish)
- Français (French)
- Deutsch (German)
- 中文 (Chinese)

## 🚀 Getting Started

### 1. Spring Boot Backend
```bash
cd springboot-backend
mvn clean package
mvn spring-boot:run
```

### 2. Frontend Application
```bash
npm install
npm run dev
```
The application runs locally on `http://localhost:3000`.
