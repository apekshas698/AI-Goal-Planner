package com.example.AI.Project.controller;

import com.example.AI.Project.event.TaskCompletedEvent;
import com.example.AI.Project.model.Task;
import com.example.AI.Project.repository.TaskRepository;

import org.springframework.context.ApplicationEventPublisher;
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

    public TaskController(TaskRepository taskRepository,
                          ApplicationEventPublisher eventPublisher) {
        this.taskRepository = taskRepository;
        this.eventPublisher = eventPublisher;
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

    /**
     * PATCH /api/tasks/{id}/status
     *
     * Updates the Kanban column a task belongs to.
     * Body: { "kanbanStatus": "IN_PROGRESS", "completed": false }
     *
     * Valid kanbanStatus values: TODO | IN_PROGRESS | DONE
     */
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
        }

        Task saved = taskRepository.save(task);

        eventPublisher.publishEvent(new TaskCompletedEvent(task.getGoalId()));

        return saved;
    }
}