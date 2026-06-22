package com.example.AI.Project.controller;

import com.example.AI.Project.event.TaskCompletedEvent;
import com.example.AI.Project.model.Task;
import com.example.AI.Project.model.User;
import com.example.AI.Project.repository.TaskRepository;
import com.example.AI.Project.repository.UserRepository;
import com.example.AI.Project.service.StreakService;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskRepository taskRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final StreakService streakService;
    private final UserRepository userRepository;

    public TaskController(TaskRepository taskRepository,
                          ApplicationEventPublisher eventPublisher,
                          StreakService streakService,
                          UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.eventPublisher = eventPublisher;
        this.streakService = streakService;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping("/goal/{goalId}")
    public List<Task> getTasksByGoal(@PathVariable Long goalId) {
        return taskRepository.findByGoalId(goalId);
    }

    @GetMapping("/goal/{goalId}/sorted")
    public List<Task> getTasksByGoalSorted(@PathVariable Long goalId) {
        List<Task> tasks = taskRepository.findByGoalId(goalId);

        Map<String, Integer> priorityOrder = new HashMap<>();
        priorityOrder.put("HIGH",   0);
        priorityOrder.put("MEDIUM", 1);
        priorityOrder.put("LOW",    2);

        tasks.sort(Comparator.comparingInt(task ->
                priorityOrder.getOrDefault(task.getAiPriority(), 3)
        ));

        return tasks;
    }

    @PutMapping("/{id}/complete")
    public Task completeTask(@PathVariable Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        task.setCompleted(true);
        task.setKanbanStatus("DONE");
        Task saved = taskRepository.save(task);

        // Update streak on task completion
        streakService.updateStreak(getCurrentUser());

        eventPublisher.publishEvent(new TaskCompletedEvent(task.getGoalId()));
        return saved;
    }

    @PutMapping("/{id}/incomplete")
    public Task incompleteTask(@PathVariable Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        task.setCompleted(false);
        task.setKanbanStatus("TODO");
        Task saved = taskRepository.save(task);

        eventPublisher.publishEvent(new TaskCompletedEvent(task.getGoalId()));
        return saved;
    }

    @PatchMapping("/{id}/status")
    public Task updateKanbanStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {

        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        String kanbanStatus = (String) body.get("kanbanStatus");
        Boolean completed   = (Boolean) body.get("completed");

        if (kanbanStatus != null) {
            task.setKanbanStatus(kanbanStatus);
        }

        if (completed != null) {
            task.setCompleted(completed);
            // Update streak when task is marked done via kanban drag
            if (completed) {
                streakService.updateStreak(getCurrentUser());
            }
        }

        Task saved = taskRepository.save(task);

        eventPublisher.publishEvent(new TaskCompletedEvent(task.getGoalId()));
        return saved;
    }
}