# OKGIP Spring Boot Backend Service

Full enterprise Spring Boot REST API for the **Organizational Knowledge Gap & Intelligence Platform (OKGIP)**.

## Project Architecture

- **Framework**: Spring Boot 3.2.3 (Java 17)
- **Database**: H2 (In-memory for development) / PostgreSQL (Production ready)
- **ORM**: Spring Data JPA / Hibernate
- **Security**: Spring Security & JWT Token Authentication
- **Build Tool**: Maven

## Directory Structure

```
springboot-backend/
├── pom.xml
├── README.md
└── src/
    ├── main/
    │   ├── java/com/okgip/
    │   │   ├── OkgipApplication.java
    │   │   ├── config/
    │   │   ├── controller/
    │   │   ├── dto/
    │   │   ├── entity/
    │   │   ├── repository/
    │   │   └── service/
    │   └── resources/
    │       └── application.yml
```

## Running Locally

### Prerequisites
- JDK 17 or higher installed
- Maven 3.8+ installed

### Step 1: Build the Project
```bash
mvn clean package
```

### Step 2: Run Spring Boot
```bash
mvn spring-boot:run
```

Or execute the JAR:
```bash
java -jar target/okgip-backend-1.0.0.jar
```

The server starts on port `8080` with context path `/api`.
- **H2 Console**: `http://localhost:8080/api/h2-console`

## Pre-seeded Credentials
- **Admin**: `admin@okgip.com` / `admin123`
- **Manager**: `manager@okgip.com` / `manager123`
- **Employee**: `employee@okgip.com` / `employee123`

## Main API Endpoints

- `POST /api/auth/login` - User Authentication
- `GET /api/employees` - Employee Directory
- `GET /api/tasks/assigned/{employeeId}` - Assigned Tasks
- `GET /api/leave` - Leave Requests Management
- `GET /api/ai/recommendations/{employeeId}` - AI Course Recommendations
- `GET /api/ai/predictive-gap/{departmentId}` - Predictive Skill Gap Analysis
- `POST /api/ai/chatbot` - AI Chatbot Assistant
