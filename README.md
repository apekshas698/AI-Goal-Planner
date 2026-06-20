# AI Goal Planner

AI Goal Planner is a full-stack web application that helps users create goals, generate AI-powered action plans, automatically track progress through task completion, visualize work on a Kanban board, predict deadlines, and chat with an AI mentor for guidance — all backed by live analytics.

## Features

* User authentication with JWT (signup/login)
* Create and manage goals, each with an AI-generated roadmap
* AI-generated task breakdown for every goal, with a second AI pass that assigns each task a priority (`HIGH`/`MEDIUM`/`LOW`), difficulty (`EASY`/`MEDIUM`/`HARD`), and estimated hours
* Event-driven automatic progress tracking — goal progress and status update automatically as tasks are completed
* Kanban board — drag and drop tasks between Todo / In Progress / Done, synced to the backend
* Deadline Prediction Agent — estimates a goal's likely finish date and completion probability based on actual task pace, with an AI-written progress insight
* Analytics Dashboard — weekly progress trend, task completion rate, daily productivity trend, goal success rate, and priority breakdown, all rendered with Recharts
* AI Daily Planner — generates a focused hour-by-hour schedule based on pending tasks and available hours
* AI Mentor Chat — conversational assistant for programming, system design, and career guidance, with full multi-turn history
* RESTful APIs with Spring Boot
* MySQL database integration
* Modern React frontend with progress bars, status badges, and interactive charts

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
* Recharts (analytics charts)
* @hello-pangea/dnd (Kanban drag and drop)
* CSS

### AI Integration
* OpenRouter API (model: `openai/gpt-oss-20b:free`)

## Key Architecture Highlights

### Event-Driven Progress Tracking

When a user marks a task as complete or incomplete, or drags it across the Kanban board, the backend:

1. `TaskController` updates the task's `completed` / `kanbanStatus` and publishes a `TaskCompletedEvent` via Spring's `ApplicationEventPublisher`.
2. `GoalProgressListener` (annotated with `@EventListener`) picks up the event, recalculates the goal's progress percentage based on completed vs. total tasks, and updates the goal's `progress` and `status` (`NOT_STARTED` / `IN_PROGRESS` / `COMPLETED`).

This decouples task updates from goal progress logic — no manual progress updates required, and new side effects (notifications, activity logs, etc.) can be added later without touching `TaskController`.

### Two-Pass AI Task Generation

When a goal is created, `AIService` first generates a roadmap, then generates a list of raw tasks, then makes a second AI call (`prioritizeTasks`) that takes the saved task names and returns a priority, difficulty, and estimated-hours rating for each — giving the Kanban board and prediction agent richer data to work with than a flat task list.

### Deadline Prediction Agent

`PredictionService` looks at a goal's actual task history — hours completed so far, days elapsed since creation, and remaining estimated hours — to compute a real pace (hours/day) and project a finish date. If the goal has a target deadline, it also computes a completion probability based on the buffer between the projected and target dates, and asks the AI for a short, specific progress insight.

### Analytics Dashboard

`AnalyticsService` aggregates a user's goals and tasks into chart-ready data: a 12-week rolling view of cumulative task completion, a 14-day productivity trend built from actual `completedAt` timestamps, overall task completion rate, goal success rate, and a priority breakdown — no hardcoded or mock numbers, everything is derived from stored data.

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
│       │       │   ├── controller/   (GoalController, TaskController, AuthController, PlannerController, ChatController, AnalyticsController)
│       │       │   ├── dto/          (AuthResponse, LoginRequest, SignupRequest, TaskDTO, TaskResponseDTO, TaskPriorityDTO, TaskPriorityResponseDTO, PlannerRequest, ChatMessage, ChatRequest, DeadlinePredictionDTO, AnalyticsDTO)
│       │       │   ├── model/        (Goal, Task, User)
│       │       │   ├── repository/   (GoalRepository, TaskRepository, UserRepository)
│       │       │   ├── service/      (AIService, UserService, AgentService, PredictionService, AnalyticsService)
│       │       │   ├── event/        (TaskCompletedEvent)
│       │       │   └── listener/     (GoalProgressListener)
│       │       └── resources/
│       │           └── application.properties
│       └── pom.xml
│
├── Frontend/
│   ├── src/
│   │   ├── components/  (Login, Signup, GoalList, KanbanBoard, DailyPlanner, ChatWindow, DeadlinePrediction, AnalyticsDashboard, TaskPriorityBadge, ProtectedRoute)
│   │   ├── context/     (AuthContext)
│   │   ├── services/    (api.js)
│   │   └── App.jsx
│   ├── public/
│   └── package.json
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
cd Frontend
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
| `/api/goals` | POST | Create a goal (AI generates plan + tasks + priorities) |
| `/api/goals/{id}` | PUT | Update a goal |
| `/api/goals/{id}` | DELETE | Delete a goal |
| `/api/goals/{id}/prediction` | GET | Get deadline prediction and AI progress insight for a goal |
| `/api/tasks/goal/{goalId}` | GET | Get tasks for a goal |
| `/api/tasks/goal/{goalId}/sorted` | GET | Get tasks for a goal, sorted by AI priority |
| `/api/tasks/{id}/complete` | PUT | Mark task complete (triggers progress recalculation) |
| `/api/tasks/{id}/incomplete` | PUT | Mark task incomplete (triggers progress recalculation) |
| `/api/tasks/{id}/status` | PATCH | Update a task's Kanban column (`TODO`/`IN_PROGRESS`/`DONE`) |
| `/api/planner/today/{goalId}` | GET | Generate hour-by-hour daily schedule for a goal |
| `/api/planner/today` | POST | Generate daily plan from custom task lists |
| `/api/chat` | POST | Send message to AI Mentor (multi-turn conversation) |
| `/api/analytics` | GET | Get aggregated analytics (progress trend, completion rates, productivity, priority breakdown) |

## Future Enhancements

* Email/in-app notifications on goal completion
* AI-generated suggestions for stalled goals
* Persistent chat history saved to database
* Exportable analytics (PDF/CSV reports)
* Deployment on AWS/Render/Vercel

## Author

**Apeksha Shukla**  
GitHub: https://github.com/apekshas698  
LinkedIn: https://www.linkedin.com/in/apeksha-shukla

## License

This project is licensed under the MIT License.
