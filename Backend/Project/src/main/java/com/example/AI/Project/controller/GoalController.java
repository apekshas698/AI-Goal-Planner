package com.example.AI.Project.controller;

import java.util.List;

import com.example.AI.Project.dto.TaskResponseDTO;
import com.example.AI.Project.model.Goal;
import com.example.AI.Project.model.Task;
import com.example.AI.Project.model.User;
import com.example.AI.Project.repository.GoalRepository;
import com.example.AI.Project.repository.TaskRepository;
import com.example.AI.Project.repository.UserRepository;
import com.example.AI.Project.service.AIService;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/goals")
public class GoalController {

    private final GoalRepository repository;
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final AIService aiService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public GoalController(
            GoalRepository repository,
            UserRepository userRepository,
            TaskRepository taskRepository,
            AIService aiService) {

        this.repository = repository;
        this.userRepository = userRepository;
        this.taskRepository = taskRepository;
        this.aiService = aiService;
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

        String roadmap =
                aiService.generatePlan(goal.getTitle());

        goal.setPlan(roadmap);

        if (goal.getStatus() == null) {
            goal.setStatus("NOT_STARTED");
        }

        if (goal.getProgress() == null) {
            goal.setProgress(0);
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

            TaskResponseDTO response =
                    objectMapper.readValue(tasksJson, TaskResponseDTO.class);

            if (response.getTasks() == null) {
                return;
            }

            response.getTasks().forEach(taskDto -> {
                if (taskDto.getName() == null || taskDto.getName().isBlank()) {
                    return;
                }
                Task task = new Task(goal.getId(), taskDto.getName());
                taskRepository.save(task);
            });

        } catch (Exception e) {
            // Don't fail goal creation if task generation/parsing fails
            e.printStackTrace();
        }
    }

    @GetMapping
    public List<Goal> getGoals() {
        User user = getCurrentUser();
        return repository.findByUserId(user.getId());
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

        return repository.save(goal);
    }
}