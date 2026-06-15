# AI Goal Planner

AI Goal Planner is a full-stack web application that helps users create goals, generate AI-powered action plans, automatically track progress through task completion, and manage tasks efficiently.

## Features

* User authentication with JWT (signup/login)
* Create and manage goals
* AI-generated goal plans and task breakdowns using OpenRouter API
* Event-driven automatic progress tracking — goal progress and status update automatically as tasks are completed
* Task management with completion checklist, status, and priority
* RESTful APIs with Spring Boot
* MySQL database integration
* Modern React frontend with progress bars and status badges

## Tech Stack

### Backend
* Java 17
* Spring Boot
* Spring Data JPA
* Spring Security + JWT (jjwt)
* Hibernate
* MySQL
* Maven

### Frontend
* React.js
* Vite
* React Router
* Axios
* CSS

### AI Integration
* OpenRouter API

## Key Architecture Highlight: Event-Driven Progress Tracking

When a user marks a task as complete or incomplete via the UI, the backend:

1. `TaskController` updates the task's `completed` status and publishes a `TaskCompletedEvent` via Spring's `ApplicationEventPublisher`.
2. `GoalProgressListener` (annotated with `@EventListener`) picks up the event, recalculates the goal's progress percentage based on completed vs. total tasks, and updates the goal's `progress` and `status` (`NOT_STARTED` / `IN_PROGRESS` / `COMPLETED`).

This decouples task updates from goal progress logic — no manual progress updates required, and new side effects (notifications, activity logs, etc.) can be added later without touching `TaskController`.

## Project Structure

```text
AI-Goal-Planner/
│
├── Backend/
│   └── Project/
│       ├── src/
│       │   └── main/
│       │       ├── java/com/example/AI/Project/
│       │       │   ├── controller/   (GoalController, TaskController, Auth)
│       │       │   ├── model/        (Goal, Task, User)
│       │       │   ├── repository/   (GoalRepository, TaskRepository, UserRepository)
│       │       │   ├── service/      (AIService)
│       │       │   ├── event/        (TaskCompletedEvent)
│       │       │   └── listener/     (GoalProgressListener)
│       │       └── resources/
│       │           └── application.properties
│       └── pom.xml
│
├── Frontend side/
│   └── ai/
│       ├── src/
│       │   ├── components/  (Login, Signup, GoalList, ProtectedRoute)
│       │   ├── context/      (AuthContext)
│       │   ├── services/     (api.js)
│       │   └── App.jsx
│       ├── public/
│       └── package.json
│
└── README.md
```

## Setup Instructions

### 1. Clone Repository

```bash
git clone https://github.com/apekshas698/AI-Goal-Planner.git
cd AI-Goal-Planner
```

### 2. Create MySQL Database

```sql
CREATE DATABASE agentdb;
```

### 3. Configure Backend

Create a local config file (not committed to git):

```text
src/main/resources/application-local.properties
```

Add:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/agentdb
spring.datasource.username=your_username
spring.datasource.password=your_password
openrouter.api.key=your_openrouter_api_key
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

In `application.properties`:

```properties
spring.application.name=backend
server.port=9090
spring.profiles.active=local
```

> **Note:** `application.properties`/`application-local.properties` containing real credentials should be added to `.gitignore`. Use `application.properties.example` as a template for required keys.

### 4. Run Backend

```bash
cd Backend/Project
mvn spring-boot:run
```

Backend URL:

```text
http://localhost:9090
```

### 5. Run Frontend

```bash
cd "Frontend side/ai"
npm install
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

## API Overview

| Endpoint | Method | Description |
|---|---|---|
| `/api/auth/signup` | POST | Register a new user |
| `/api/auth/login` | POST | Login and receive JWT |
| `/api/goals` | GET | Get all goals for logged-in user |
| `/api/goals` | POST | Create a goal (AI generates plan + tasks) |
| `/api/goals/{id}` | PUT | Update a goal |
| `/api/goals/{id}` | DELETE | Delete a goal |
| `/api/tasks/goal/{goalId}` | GET | Get tasks for a goal |
| `/api/tasks/{id}/complete` | PUT | Mark task complete (triggers progress recalculation) |
| `/api/tasks/{id}/incomplete` | PUT | Mark task incomplete (triggers progress recalculation) |

## Future Enhancements

* Goal Analytics Dashboard
* Email/in-app notifications on goal completion
* AI-generated suggestions for stalled goals
* Deployment on AWS/Render/Vercel

## Author

**Apeksha Shukla**
GitHub: https://github.com/apekshas698
LinkedIn: https://www.linkedin.com/in/apeksha-shukla

## License

This project is licensed under the MIT License.
