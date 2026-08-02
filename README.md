# OKGIP — Organizational Knowledge Gap & Intelligence Platform

OKGIP is an end-to-end enterprise platform designed to identify, visualize, and bridge skill gaps within organizations using AI analytics, interactive dashboards, and real-time learning management.

## 📁 Repository Structure

OKGIP-updated/
│
├── backend/                          ← Express/Node API (what your `npm run dev`/`start` actually runs)
│   ├── config/
│   │   ├── ca.pem                    ← Aiven CA cert (git-ignored via *.pem)
│   │   ├── db.ts                     ← in-memory mock database
│   │   └── mysqlDb.ts                ← real Aiven MySQL connection
│   ├── controllers/                  ← 18 controllers (employee, auth, task, leave, etc.)
│   ├── middleware/
│   │   └── auth.ts
│   └── routes/                       ← 18 route files, one per controller
│
├── src/                              ← React 19 + Vite frontend
│   ├── components/                   ← Navbar, Sidebar, Modal, Toast, AiChatWidget, Breadcrumb
│   ├── context/                      ← Auth, Language, Theme contexts
│   ├── layouts/
│   │   └── DashboardLayout.tsx
│   ├── pages/                        ← 20 pages (Dashboard, Login, EmployeeManagement, etc.)
│   ├── routes/
│   │   └── AppRoutes.tsx
│   ├── services/
│   │   └── api.ts
│   ├── types.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── springboot-backend/               ← separate Java 17 / Spring Boot 3.2 backend (alternative to backend/)
│   ├── pom.xml
│   └── src/main/java/com/okgip/
│       ├── config/, controller/, dto/, entity/, repository/
│       └── OkgipApplication.java
│
├── database/                         ← SQL schema/seed files
│   ├── aiven_okgip_db.sql
│   ├── schema.sql
│   └── seed-data.sql
│
├── docs/
│   └── API_Documentation.md
│
├── build-server.mjs                  ← bundles server.ts → dist/server.cjs (the file we just discussed)
├── server.ts                         ← Express entry point, serves both API + Vite/React frontend
├── vite.config.ts
├── index.html
├── package.json
├── tsconfig.json
└── .env.example

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
