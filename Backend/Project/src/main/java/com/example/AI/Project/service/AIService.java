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
                    {"name":"Learn OOP"}
                  ]
                }

                Do not return markdown. Do not return explanation. Do not use ```json.
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
                    {"name":"Task name","priority":"HIGH","estimatedHours":2,"difficulty":"MEDIUM"}
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
                ? "None" : String.join(", ", completedTasks);
        String pending = (pendingTasks == null || pendingTasks.isEmpty())
                ? "None" : String.join(", ", pendingTasks);

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
                    {"role":"system","content":"You are an expert software engineering mentor. Help users learn programming, system design, and career growth. Give clear, practical, and encouraging advice."}
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
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, request, String.class);

            JsonNode root = objectMapper.readTree(response.getBody());
            return root.path("choices").get(0).path("message").path("content").asText();

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

    public String generateResumeSection(String target, String section, String description) {
        String prompt = """
                You are an expert tech career coach helping a student prepare for: %s

                Generate a concise, actionable %s roadmap covering: %s

                Format your response as a numbered list of 6-8 key items.
                Each item should be on its own line starting with a number and period.
                After each item, add a short (5-8 word) tip or resource in parentheses.

                Example format:
                1. Topic or task name (Tip or resource here)

                Be specific to the target role. No markdown headers. No extra explanation. Just the numbered list.
                """.formatted(
                target.replace("%", "%%"),
                section.replace("%", "%%"),
                description.replace("%", "%%")
        );
        return callAI(prompt);
    }

    /**
     * RAG answer — responds strictly from the provided document context.
     * Called by RagService after retrieving relevant chunks from MySQL.
     */
    public String answerWithContext(String question, String context) {
        String safeQuestion = question.replace("\"", "\\\"").replace("\n", "\\n");
        String safeContext  = context
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");

        String prompt = """
                You are a helpful assistant that answers questions strictly based on the provided document context.
                If the answer is not in the context, say "I don't have enough information in the uploaded documents to answer that."
                Do not use any external knowledge. Be concise and accurate.

                Context from uploaded documents:
                %s

                Question: %s
                """.formatted(safeContext, safeQuestion);

        String result = callAI(prompt);
        if (result == null || result.isBlank()) {
            return "I couldn't generate an answer at this time. Please try again.";
        }
        return result.trim();
    }

    private String callAI(String prompt) {
        try {
            String url = "https://openrouter.ai/api/v1/chat/completions";

            String body = """
                    {
                      "model":"openai/gpt-oss-20b:free",
                      "messages":[
                        {"role":"system","content":"You are an expert planner."},
                        {"role":"user","content":"%s"}
                      ]
                    }
                    """.formatted(prompt.replace("\"", "\\\"").replace("\n", "\\n"));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);
            headers.add("HTTP-Referer", "http://localhost:5173");
            headers.add("X-Title", "AI Goal Planner");

            HttpEntity<String> request = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, request, String.class);

            JsonNode root = objectMapper.readTree(response.getBody());
            return root.path("choices").get(0).path("message").path("content").asText();

        } catch (Exception e) {
            e.printStackTrace();
            return "";
        }
    }
}