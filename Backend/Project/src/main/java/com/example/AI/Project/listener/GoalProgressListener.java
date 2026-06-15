package com.example.AI.Project.listener;

import com.example.AI.Project.event.TaskCompletedEvent;
import com.example.AI.Project.model.Goal;
import com.example.AI.Project.model.Task;
import com.example.AI.Project.repository.GoalRepository;
import com.example.AI.Project.repository.TaskRepository;

import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class GoalProgressListener {

    private final GoalRepository goalRepository;
    private final TaskRepository taskRepository;

    public GoalProgressListener(GoalRepository goalRepository, TaskRepository taskRepository) {
        this.goalRepository = goalRepository;
        this.taskRepository = taskRepository;
    }

    @EventListener
    public void onTaskCompleted(TaskCompletedEvent event) {
        Long goalId = event.getGoalId();

        Goal goal = goalRepository.findById(goalId).orElse(null);
        if (goal == null) return;

        List<Task> tasks = taskRepository.findByGoalId(goalId);
        if (tasks.isEmpty()) return;

        long completedCount = tasks.stream().filter(Task::isCompleted).count();
        int progress = (int) Math.round((completedCount * 100.0) / tasks.size());

        goal.setProgress(progress);

        if (progress == 0) {
            goal.setStatus("NOT_STARTED");
        } else if (progress == 100) {
            goal.setStatus("COMPLETED");
        } else {
            goal.setStatus("IN_PROGRESS");
        }

        goalRepository.save(goal);
    }
}