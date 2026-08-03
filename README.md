# OKGIP — Organizational Knowledge Gap & Intelligence Platform

OKGIP is an end-to-end enterprise platform designed to identify, visualize, and bridge skill gaps within organizations using AI analytics, interactive dashboards, and real-time learning management.

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

# 📂 Project Structure

```text
OKGIP-Updated
│
├── springboot-backend/
│   ├── src/main/java/com/okgip/
│   │   ├── config/
│   │   ├── controller/
│   │   ├── service/
│   │   ├── repository/
│   │   ├── entity/
│   │   ├── dto/
│   │   ├── security/
│   │   └── OkgipApplication.java
│   ├── src/main/resources/
│   │   └── application.yml
│   └── pom.xml
│
├── src/
│   ├── components/
│   ├── context/
│   ├── layouts/
│   ├── pages/
│   ├── routes/
│   ├── services/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── database/
│   ├── schema.sql
│   ├── seed-data.sql
│   └── aiven_okgip_db.sql
│
├── docs/
│   └── API_Documentation.md
│
├── package.json
├── vite.config.ts
├── tsconfig.json
├── README.md
└── .env.example
```

## 🛠️ Tech Stack

### Frontend
- React 19
- TypeScript
- Vite
- React Router
- Axios
- CSS

### Backend
- Spring Boot 3
- Spring Security
- Spring Data JPA
- JWT Authentication

### Database
- Aiven MySQL (Cloud)

### Deployment
- Render

## 🏗️ Architecture

```text
React Frontend
      │
      ▼
Spring Boot REST API
      │
      ▼
Spring Security + JWT
      │
      ▼
Spring Data JPA
      │
      ▼
Aiven MySQL Database
```

## 📋 Features

- User Authentication (JWT)
- Role-Based Login (Admin, Manager, Employee)
- Employee Management
- Department Management
- Skill Management
- Knowledge Gap Analysis
- Training Management
- Reports & Analytics
- Notifications
- AI-Based Recommendations

## 🗄️ Database Tables

- users
- employees
- departments
- skills
- employee_skills
- knowledge_gaps
- training_programs
- training_assignments
- notifications



## 🌐 Multi-Language Support
Supported languages in the application interface:
- English
- தமிழ் (Tamil)
- हिंदी (Hindi)
- Español (Spanish)
- Français (French)
- Deutsch (German)
- 中文 (Chinese)


## 🚀 Live Demo

https://okgip-updated.onrender.com/

## 💻 GitHub Repository

https://github.com/harishkumar636r/OKGIP-Updated
```
The application runs locally on `http://localhost:3000`.
