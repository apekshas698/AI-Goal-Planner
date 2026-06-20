package com.example.AI.Project.service;

import com.example.AI.Project.dto.ChatMessage;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
public class AIService {

    @Value("${openrouter.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String generatePlan(String goal) {
        String prompt = """
                Create a detailed roadmap for %s.
                Give phases, tasks, projects and milestones.
                """.formatted(goal.replace("%", "%%"));

        return callAI(prompt);
    }

    public String generateTasks(String goal) {
        String prompt = """
                Create 10 actionable tasks for the goal: %s

                Return ONLY valid JSON.

                Example:

                {
                  "tasks": [
                    {"name":"Learn Java Basics"},
                    {"name":"Learn OOP"},
                    {"name":"Learn Collections"}
                  ]
                }

                Do not return markdown.
                Do not return explanation.
                Do not use ```json.
                """.formatted(goal.replace("%", "%%"));

        return callAI(prompt);
    }

    public String prioritizeTasks(String goal, List<String> taskNames) {
        String taskList = String.join(", ", taskNames);

        String prompt = """
                You are an expert project planner. Given a goal and a list of tasks, assign a priority, difficulty, and estimated hours to each task.

                Goal: %s
                Tasks: %s

                Return ONLY valid JSON in this exact structure:

                {
                  "tasks": [
                    {"name":"Task name","priority":"HIGH","estimatedHours":2,"difficulty":"MEDIUM"},
                    {"name":"Task name","priority":"LOW","estimatedHours":1,"difficulty":"EASY"}
                  ]
                }

                Priority must be: HIGH, MEDIUM, or LOW
                Difficulty must be: EASY, MEDIUM, or HARD
                estimatedHours must be a number between 1 and 8

                Do not return markdown. Do not return explanation. Do not use ```json.
                """.formatted(goal.replace("%", "%%"), taskList.replace("%", "%%"));

        return callAI(prompt);
    }

    public String generateDailyPlan(String goal,
                                    List<String> completedTasks,
                                    List<String> pendingTasks,
                                    int availableHours) {

        String completed = (completedTasks == null || completedTasks.isEmpty())
                ? "None"
                : String.join(", ", completedTasks);

        String pending = (pendingTasks == null || pendingTasks.isEmpty())
                ? "None"
                : String.join(", ", pendingTasks);

        String prompt = """
                You are a smart daily planner like Notion AI.

                Goal: %s
                Completed Tasks: %s
                Pending Tasks: %s
                Available Time Today: %d hours

                Create a focused hour-by-hour schedule for today.
                Start from 9:00 AM. Each slot is 1 hour.
                Only schedule tasks from the Pending Tasks list.
                Format exactly like this:

                9:00 AM - Task name
                10:00 AM - Task name
                11:00 AM - Task name

                Keep it practical and motivating. No extra explanation.
                """.formatted(goal, completed, pending, availableHours);

        return callAI(prompt);
    }

    public String chat(List<ChatMessage> messages) {
        try {
            String url = "https://openrouter.ai/api/v1/chat/completions";

            StringBuilder messagesJson = new StringBuilder();
            messagesJson.append("[");
            messagesJson.append("""
                    {"role":"system","content":"You are an expert software engineering mentor. Help users learn programming, system design, and career growth. Give clear, practical, and encouraging advice. Format responses with short paragraphs. Use bullet points for steps or lists."}
                    """);

            for (ChatMessage msg : messages) {
                String safeContent = msg.getContent()
                        .replace("\\", "\\\\")
                        .replace("\"", "\\\"")
                        .replace("\n", "\\n")
                        .replace("\r", "\\r")
                        .replace("\t", "\\t");

                messagesJson.append(",{\"role\":\"")
                        .append(msg.getRole())
                        .append("\",\"content\":\"")
                        .append(safeContent)
                        .append("\"}");
            }

            messagesJson.append("]");

            String body = """
                    {
                      "model": "openai/gpt-oss-20b:free",
                      "messages": %s
                    }
                    """.formatted(messagesJson.toString());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);
            headers.add("HTTP-Referer", "http://localhost:5173");
            headers.add("X-Title", "AI Goal Planner");

            HttpEntity<String> request = new HttpEntity<>(body, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    request,
                    String.class
            );

            String json = response.getBody();
            JsonNode root = objectMapper.readTree(json);

            return root.path("choices")
                    .get(0)
                    .path("message")
                    .path("content")
                    .asText();

        } catch (Exception e) {
            e.printStackTrace();
            return "Sorry, I couldn't process your message. Please try again.";
        }
    }

    public String generateProgressInsight(String goalTitle,
                                          int progress,
                                          int completedTasks,
                                          int totalTasks,
                                          double paceHoursPerDay,
                                          String predictedFinishDate,
                                          int probability,
                                          String deadlineDate) {

        String deadlineLine = deadlineDate != null
                ? "Target deadline: " + deadlineDate
                : "No fixed deadline set.";

        String prompt = """
                You are an AI progress coach reviewing a user's goal.

                Goal: %s
                Progress: %d%% complete (%d of %d tasks done)
                Current pace: %.1f hours of work per day
                Predicted finish date: %s
                Completion probability: %d%%
                %s

                Write ONE short, specific, encouraging sentence (max 22 words) about
                their progress and one concrete next step. No markdown, no quotes.
                """.formatted(
                goalTitle.replace("%", "%%"),
                progress, completedTasks, totalTasks,
                paceHoursPerDay, predictedFinishDate, probability,
                deadlineLine.replace("%", "%%")
        );

        String result = callAI(prompt);

        if (result == null || result.isBlank()) {
            return probability >= 60
                    ? "You're on track — keep up the consistent pace to hit your goal."
                    : "Pace is a bit behind target — try blocking dedicated time daily to catch up.";
        }

        return result.trim().replace("\"", "");
    }

    private String callAI(String prompt) {
        try {
            String url = "https://openrouter.ai/api/v1/chat/completions";

            String body = """
                    {
                      "model":"openai/gpt-oss-20b:free",
                      "messages":[
                        {
                          "role":"system",
                          "content":"You are an expert planner."
                        },
                        {
                          "role":"user",
                          "content":"%s"
                        }
                      ]
                    }
                    """.formatted(prompt.replace("\"", "\\\"").replace("\n", "\\n"));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);
            headers.add("HTTP-Referer", "http://localhost:5173");
            headers.add("X-Title", "AI Goal Planner");

            HttpEntity<String> request = new HttpEntity<>(body, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    request,
                    String.class
            );

            String json = response.getBody();
            JsonNode root = objectMapper.readTree(json);

            return root.path("choices")
                    .get(0)
                    .path("message")
                    .path("content")
                    .asText();

        } catch (Exception e) {
            e.printStackTrace();
            return "";
        }
    }
}