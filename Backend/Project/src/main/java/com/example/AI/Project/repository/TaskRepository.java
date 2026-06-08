package com.example.AI.Project.repository;

import com.example.AI.Project.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskRepository
        extends JpaRepository<Task, Long> {

    List<Task> findByGoalId(Long goalId);
}