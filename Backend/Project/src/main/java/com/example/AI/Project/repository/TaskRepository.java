package com.example.AI.Project.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.AI.Project.model.Task;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByGoalId(Long goalId);

    long countByGoalIdInAndCompletedFalse(List<Long> goalIds);
}