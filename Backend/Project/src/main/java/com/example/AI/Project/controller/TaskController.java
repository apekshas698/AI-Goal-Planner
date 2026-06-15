package com.example.AI.Project.controller;

import com.example.AI.Project.event.TaskCompletedEvent;
import com.example.AI.Project.model.Task;
import com.example.AI.Project.repository.TaskRepository;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskRepository taskRepository;
    private final ApplicationEventPublisher eventPublisher;

    public TaskController(TaskRepository taskRepository, ApplicationEventPublisher eventPublisher) {
        this.taskRepository = taskRepository;
        this.eventPublisher = eventPublisher;
    }

    @GetMapping("/goal/{goalId}")
    public List<Task> getTasksByGoal(@PathVariable Long goalId) {
        return taskRepository.findByGoalId(goalId);
    }

    @PutMapping("/{id}/complete")
    public Task completeTask(@PathVariable Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        task.setCompleted(true);
        Task saved = taskRepository.save(task);

        eventPublisher.publishEvent(new TaskCompletedEvent(task.getGoalId()));

        return saved;
    }

    @PutMapping("/{id}/incomplete")
    public Task incompleteTask(@PathVariable Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        task.setCompleted(false);
        Task saved = taskRepository.save(task);

        eventPublisher.publishEvent(new TaskCompletedEvent(task.getGoalId()));

        return saved;
    }
}