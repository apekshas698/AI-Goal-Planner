package com.example.AI.Project.controller;

import com.example.AI.Project.model.Task;
import com.example.AI.Project.repository.TaskRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin("*")
public class TaskController {

    private final TaskRepository repository;

    public TaskController(TaskRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/{goalId}")
    public List<Task> getTasks(
            @PathVariable Long goalId) {

        return repository.findByGoalId(goalId);
    }

    @PutMapping("/{taskId}")
    public Task updateTask(
            @PathVariable Long taskId,
            @RequestBody Task updatedTask) {

        Task task =
                repository.findById(taskId)
                        .orElseThrow();

        task.setCompleted(updatedTask.isCompleted());

        return repository.save(task);
    }
}