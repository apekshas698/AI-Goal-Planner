package com.example.AI.Project.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

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

    private String callAI(String prompt) {

        try {

            String url =
                    "https://openrouter.ai/api/v1/chat/completions";

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

            headers.add(
                    "HTTP-Referer",
                    "http://localhost:5173"
            );

            headers.add(
                    "X-Title",
                    "AI Goal Planner"
            );

            HttpEntity<String> request =
                    new HttpEntity<>(body, headers);

            ResponseEntity<String> response =
                    restTemplate.exchange(
                            url,
                            HttpMethod.POST,
                            request,
                            String.class
                    );

            String json = response.getBody();

            JsonNode root =
                    objectMapper.readTree(json);

            String content =
                    root.path("choices")
                            .get(0)
                            .path("message")
                            .path("content")
                            .asText();

            return content;

        } catch (Exception e) {

            e.printStackTrace();

            return "";
        }
    }
}