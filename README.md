# AI Goal Planner

AI Goal Planner is a full-stack web application that helps users create goals, generate AI-powered action plans, automatically track progress through task completion, get a personalized daily schedule, and chat with an AI mentor for guidance.

## Features

* User authentication with JWT (signup/login)
* Create and manage goals
* AI-generated goal plans and task breakdowns using OpenRouter API
* Event-driven automatic progress tracking — goal progress and status update automatically as tasks are completed
* Task management with completion checklist, status, and priority
* AI Daily Planner — generates a focused hour-by-hour schedule based on pending tasks and available hours
* AI Mentor Chat — conversational assistant for programming, system design, and career guidance
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
* OpenRouter API (model: `openai/gpt-oss-20b:free`)

## Key Architecture Highlights

### Event-Driven Progress Tracking

When a user marks a task as complete or incomplete via the UI, the backend:

1. `TaskController` updates the task's `completed` status and publishes a `TaskCompletedEvent` via Spring's `ApplicationEventPublisher`.
2. `GoalProgressListener` (annotated with `@EventListener`) picks up the event, recalculates the goal's progress percentage based on completed vs. total tasks, and updates the goal's `progress` and `status` (`NOT_STARTED` / `IN_PROGRESS` / `COMPLETED`).

This decouples task updates from goal progress logic — no manual progress updates required, and new side effects (notifications, activity logs, etc.) can be added later without touching `TaskController`.

### AI Mentor Chat (Multi-Turn Conversation)

The chat feature sends the full conversation history with every request, giving the AI memory of the ongoing session. The backend exposes `POST /api/chat`, which accepts a list of messages and returns the assistant's reply. The system prompt instructs the AI to act as a software engineering mentor covering programming, system design, and career growth.

### AI Daily Planner

Given a saved goal, the planner fetches all its tasks, separates completed from pending ones, and passes them along with the user's available hours to the AI. It returns a focused hour-by-hour schedule starting from 9:00 AM using only pending tasks.

## Project Structure

```text
AI-Goal-Planner/
│
├── Backend/
│   └── Project/
│       ├── src/
│       │   └── main/
│       │       ├── java/com/example/AI/Project/
│       │       │   ├── config/       (SecurityConfig, JwtUtil, JwtAuthenticationFilter)
│       │       │   ├── controller/   (GoalController, TaskController, AuthController, PlannerController, ChatController)
│       │       │   ├── dto/          (AuthResponse, LoginRequest, SignupRequest, TaskDTO, TaskResponseDTO, PlannerRequest, ChatMessage, ChatRequest)
│       │       │   ├── model/        (Goal, Task, User)
│       │       │   ├── repository/   (GoalRepository, TaskRepository, UserRepository)
│       │       │   ├── service/      (AIService, UserService, AgentService)
│       │       │   ├── event/        (TaskCompletedEvent)
│       │       │   └── listener/     (GoalProgressListener)
│       │       └── resources/
│       │           └── application.properties
│       └── pom.xml
│
├── Frontend side/
│   └── ai/
│       ├── src/
│       │   ├── components/  (Login, Signup, GoalList, DailyPlanner, ChatWindow, ProtectedRoute)
│       │   ├── context/     (AuthContext)
│       │   ├── services/    (api.js)
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

> **Note:** `application.properties` / `application-local.properties` containing real credentials should be added to `.gitignore`. Use `application.properties.example` as a template for required keys.

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
| `/api/planner/today/{goalId}` | GET | Generate hour-by-hour daily schedule for a goal |
| `/api/planner/today` | POST | Generate daily plan from custom task lists |
| `/api/chat` | POST | Send message to AI Mentor (multi-turn conversation) |

## Future Enhancements

* Goal Analytics Dashboard
* Email/in-app notifications on goal completion
* AI-generated suggestions for stalled goals
* Persistent chat history saved to database
* Deployment on AWS/Render/Vercel

## Author

**Apeksha Shukla**  
GitHub: https://github.com/apekshas698  
LinkedIn: https://www.linkedin.com/in/apeksha-shukla

## License

This project is licensed under the MIT License.
