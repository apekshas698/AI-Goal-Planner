package com.example.AI.Project.controller;

import java.util.List;

import com.example.AI.Project.model.Goal;
import com.example.AI.Project.repository.GoalRepository;
import com.example.AI.Project.service.AIService;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/goals")
@CrossOrigin("*")
public class GoalController {

    private final GoalRepository repository;
    private final AIService aiService;

    public GoalController(
            GoalRepository repository,
            AIService aiService) {

        this.repository = repository;
        this.aiService = aiService;
    }

    @PostMapping
    public Goal createGoal(@RequestBody Goal goal) {

        String roadmap =
                aiService.generatePlan(goal.getTitle());

        goal.setPlan(roadmap);

        if(goal.getStatus() == null){
            goal.setStatus("NOT_STARTED");
        }

        if(goal.getProgress() == null){
            goal.setProgress(0);
        }

        return repository.save(goal);
    }

    @GetMapping
    public List<Goal> getGoals() {
        return repository.findAll();
    }

    @DeleteMapping("/{id}")
    public String deleteGoal(@PathVariable Long id) {

        repository.deleteById(id);

        return "Goal Deleted";
    }
    @PutMapping("/{id}")
    public Goal updateGoal(
            @PathVariable Long id,
            @RequestBody Goal updatedGoal) {

        Goal goal = repository.findById(id)
                .orElseThrow();

        goal.setTitle(updatedGoal.getTitle());
        goal.setStatus(updatedGoal.getStatus());
        goal.setProgress(updatedGoal.getProgress());

        return repository.save(goal);
    }
}