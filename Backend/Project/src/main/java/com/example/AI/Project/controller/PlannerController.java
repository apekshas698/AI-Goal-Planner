// src/main/java/com/example/AI/Project/controller/PlannerController.java
package com.example.AI.Project.controller;

import com.example.AI.Project.dto.PlannerRequest;
import com.example.AI.Project.model.Goal;
import com.example.AI.Project.model.Task;
import com.example.AI.Project.model.User;
import com.example.AI.Project.repository.GoalRepository;
import com.example.AI.Project.repository.TaskRepository;
import com.example.AI.Project.repository.UserRepository;
import com.example.AI.Project.service.AIService;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/planner")
public class PlannerController {

    private final GoalRepository goalRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final AIService aiService;

    public PlannerController(
            GoalRepository goalRepository,
            TaskRepository taskRepository,
            UserRepository userRepository,
            AIService aiService) {
        this.goalRepository = goalRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.aiService = aiService;
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @PostMapping("/today")
    public String getTodaysPlan(@RequestBody PlannerRequest request) {
        return aiService.generateDailyPlan(
                request.getGoal(),
                request.getCompletedTasks(),
                request.getPendingTasks(),
                request.getAvailableHours()
        );
    }

    // Auto-build planner from a saved goal ID (convenience endpoint)
    @GetMapping("/today/{goalId}")
    public String getTodaysPlanForGoal(@PathVariable Long goalId,
                                       @RequestParam(defaultValue = "3") int hours) {
        User user = getCurrentUser();

        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new RuntimeException("Goal not found"));

        if (!goal.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Not authorized");
        }

        List<Task> tasks = taskRepository.findByGoalId(goalId);

        List<String> completed = tasks.stream()
                .filter(Task::isCompleted)
                .map(Task::getTaskName)
                .collect(Collectors.toList());

        List<String> pending = tasks.stream()
                .filter(t -> !t.isCompleted())
                .map(Task::getTaskName)
                .collect(Collectors.toList());

        return aiService.generateDailyPlan(goal.getTitle(), completed, pending, hours);
    }
}