package com.example.AI.Project.service;

import com.example.AI.Project.model.Goal;
import com.example.AI.Project.model.Task;
import com.example.AI.Project.repository.TaskRepository;
import org.springframework.stereotype.Service;

@Service
public class AgentService {

    private final TaskRepository taskRepository;

    public AgentService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public void updateGoalProgress(Goal goal) {

        long total =
                taskRepository.findByGoalId(goal.getId()).size();

        long completed =
                taskRepository.findByGoalId(goal.getId())
                        .stream()
                        .filter(Task::isCompleted)
                        .count();

        if (total == 0) {
            goal.setProgress(0);
            return;
        }

        int progress =
                (int) ((completed * 100) / total);

        goal.setProgress(progress);

        if (progress == 100) {
            goal.setStatus("COMPLETED");
        } else {
            goal.setStatus("IN_PROGRESS");
        }
    }
}