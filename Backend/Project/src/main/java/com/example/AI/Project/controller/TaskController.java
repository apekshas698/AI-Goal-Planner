package com.example.AI.Project.controller;

import com.example.AI.Project.model.Goal;
import com.example.AI.Project.model.Task;
import com.example.AI.Project.repository.GoalRepository;
import com.example.AI.Project.repository.TaskRepository;
import com.example.AI.Project.service.AgentService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin("*")
public class TaskController {

    private final TaskRepository repository;
    private final GoalRepository goalRepository;
    private final AgentService agentService;

    public TaskController(
            TaskRepository repository,
            GoalRepository goalRepository,
            AgentService agentService) {

        this.repository = repository;
        this.goalRepository = goalRepository;
        this.agentService = agentService;
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

        Task savedTask = repository.save(task);

        Goal goal = goalRepository.findById(task.getGoalId())
                .orElseThrow();

        agentService.updateGoalProgress(goal);
        goalRepository.save(goal);

        return savedTask;
    }
}