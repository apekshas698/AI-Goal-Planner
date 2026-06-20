package com.example.AI.Project.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.example.AI.Project.dto.DeadlinePredictionDTO;
import com.example.AI.Project.dto.TaskPriorityDTO;
import com.example.AI.Project.dto.TaskPriorityResponseDTO;
import com.example.AI.Project.dto.TaskResponseDTO;
import com.example.AI.Project.model.Goal;
import com.example.AI.Project.model.Task;
import com.example.AI.Project.model.User;
import com.example.AI.Project.repository.GoalRepository;
import com.example.AI.Project.repository.TaskRepository;
import com.example.AI.Project.repository.UserRepository;
import com.example.AI.Project.service.AIService;
import com.example.AI.Project.service.PredictionService;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/goals")
public class GoalController {

    private final GoalRepository repository;
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final AIService aiService;
    private final PredictionService predictionService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public GoalController(
            GoalRepository repository,
            UserRepository userRepository,
            TaskRepository taskRepository,
            AIService aiService,
            PredictionService predictionService) {

        this.repository = repository;
        this.userRepository = userRepository;
        this.taskRepository = taskRepository;
        this.aiService = aiService;
        this.predictionService = predictionService;
    }

    private User getCurrentUser() {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @PostMapping
    public Goal createGoal(@RequestBody Goal goal) {

        String roadmap = aiService.generatePlan(goal.getTitle());
        goal.setPlan(roadmap);

        if (goal.getStatus() == null) {
            goal.setStatus("NOT_STARTED");
        }

        if (goal.getProgress() == null) {
            goal.setProgress(0);
        }

        if (goal.getCreatedAt() == null) {
            goal.setCreatedAt(LocalDateTime.now());
        }

        goal.setUser(getCurrentUser());

        Goal savedGoal = repository.save(goal);

        generateAndSaveTasks(savedGoal);

        return savedGoal;
    }

    private void generateAndSaveTasks(Goal goal) {
        try {
            String tasksJson = aiService.generateTasks(goal.getTitle());

            if (tasksJson == null || tasksJson.isBlank()) {
                return;
            }

            // Strip markdown fences if AI wraps response in ```json ... ```
            String cleanTasksJson = stripMarkdown(tasksJson);

            TaskResponseDTO response =
                    objectMapper.readValue(cleanTasksJson, TaskResponseDTO.class);

            if (response.getTasks() == null) {
                return;
            }

            // Save all tasks first
            List<Task> savedTasks = new ArrayList<>();
            response.getTasks().forEach(taskDto -> {
                if (taskDto.getName() == null || taskDto.getName().isBlank()) {
                    return;
                }
                Task task = new Task(goal.getId(), taskDto.getName());
                savedTasks.add(taskRepository.save(task));
            });

            // Then ask AI to prioritize them in a second pass
            if (!savedTasks.isEmpty()) {
                prioritizeSavedTasks(goal.getTitle(), savedTasks);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void prioritizeSavedTasks(String goalTitle, List<Task> tasks) {
        try {
            List<String> names = tasks.stream()
                    .map(Task::getTaskName)
                    .collect(Collectors.toList());

            String json = aiService.prioritizeTasks(goalTitle, names);

            if (json == null || json.isBlank()) {
                return;
            }

            // Strip markdown fences if AI returns ```json ... ```
            String cleanJson = stripMarkdown(json);

            TaskPriorityResponseDTO prioritized =
                    objectMapper.readValue(cleanJson, TaskPriorityResponseDTO.class);

            if (prioritized.getTasks() == null) {
                return;
            }

            // Build a lookup map by task name for O(1) matching
            Map<String, TaskPriorityDTO> byName = new HashMap<>();
            prioritized.getTasks().forEach(p -> byName.put(p.getName(), p));

            // Apply priority data and save each task
            tasks.forEach(task -> {
                TaskPriorityDTO p = byName.get(task.getTaskName());
                if (p != null) {
                    task.setAiPriority(p.getPriority());
                    task.setEstimatedHours(p.getEstimatedHours());
                    task.setDifficulty(p.getDifficulty());
                    taskRepository.save(task);
                }
            });

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /**
     * Strips markdown code fences that some AI models wrap JSON in.
     * Handles: ```json ... ``` and ``` ... ```
     */
    private String stripMarkdown(String raw) {
        if (raw == null) return null;
        String trimmed = raw.trim();
        // Remove ```json or ``` at start
        if (trimmed.startsWith("```")) {
            int firstNewline = trimmed.indexOf('\n');
            if (firstNewline != -1) {
                trimmed = trimmed.substring(firstNewline + 1);
            }
        }
        // Remove ``` at end
        if (trimmed.endsWith("```")) {
            trimmed = trimmed.substring(0, trimmed.lastIndexOf("```")).trim();
        }
        return trimmed;
    }

    @GetMapping
    public List<Goal> getGoals() {
        User user = getCurrentUser();
        return repository.findByUserId(user.getId());
    }

    // Deadline Prediction Agent
    @GetMapping("/{id}/prediction")
    public DeadlinePredictionDTO getDeadlinePrediction(@PathVariable Long id) {
        Goal goal = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Goal not found"));

        User user = getCurrentUser();
        if (!goal.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Not authorized");
        }

        List<Task> tasks = taskRepository.findByGoalId(id);
        return predictionService.predict(goal, tasks);
    }

    @DeleteMapping("/{id}")
    public String deleteGoal(@PathVariable Long id) {

        Goal goal = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Goal not found"));

        User user = getCurrentUser();

        if (!goal.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Not authorized to delete this goal");
        }

        repository.deleteById(id);

        return "Goal Deleted";
    }

    @PutMapping("/{id}")
    public Goal updateGoal(
            @PathVariable Long id,
            @RequestBody Goal updatedGoal) {

        Goal goal = repository.findById(id)
                .orElseThrow();

        User user = getCurrentUser();

        if (!goal.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Not authorized to update this goal");
        }

        goal.setTitle(updatedGoal.getTitle());
        goal.setStatus(updatedGoal.getStatus());
        goal.setProgress(updatedGoal.getProgress());
        goal.setTargetDays(updatedGoal.getTargetDays());

        return repository.save(goal);
    }
}