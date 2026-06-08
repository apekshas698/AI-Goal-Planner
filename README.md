# AI Goal Planner

AI Goal Planner is a full-stack web application that helps users create goals, generate AI-powered action plans, track progress, and manage tasks efficiently.

## Features

* Create and manage goals
* AI-generated goal plans using OpenRouter API
* Track goal progress
* Task management system
* RESTful APIs with Spring Boot
* MySQL database integration
* Modern React frontend

## Tech Stack

### Backend

* Java 20
* Spring Boot
* Spring Data JPA
* Hibernate
* MySQL
* Maven

### Frontend

* React.js
* Vite
* Axios
* CSS

### AI Integration

* OpenRouter API

## Project Structure

```text
AI-Goal-Planner/
│
├── Backend/
│   └── Project/
│       ├── src/
│       ├── pom.xml
│       └── application.properties
│
├── Frontend side/
│   └── ai/
│       ├── src/
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

Create:

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
## Future Enhancements

* User Authentication (JWT)
* Goal Analytics Dashboard
* Email Notifications
* AI Progress Suggestions
* Deployment on AWS/Render/Vercel

## Author

**Apeksha Shukla**

GitHub: https://github.com/apekshas698

LinkedIn: https://www.linkedin.com/in/apeksha-shukla

## License

This project is licensed under the MIT License.
