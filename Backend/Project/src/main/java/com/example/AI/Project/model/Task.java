package com.example.AI.Project.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tasks")
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long goalId;

    private String taskName;

    private boolean completed;

    private Integer priority;

    private String status;

    /**
     * Tracks which Kanban column this task lives in.
     * Values: "TODO" | "IN_PROGRESS" | "DONE"
     * Defaults to "TODO" on creation.
     */
    @Column(name = "kanban_status")
    private String kanbanStatus;

    private LocalDateTime createdAt;

    private LocalDateTime completedAt;

    public Task() {
        this.createdAt    = LocalDateTime.now();
        this.status       = "PENDING";
        this.completed    = false;
        this.priority     = 1;
        this.kanbanStatus = "TODO";
    }

    public Task(Long goalId, String taskName) {
        this.goalId       = goalId;
        this.taskName     = taskName;
        this.completed    = false;
        this.status       = "PENDING";
        this.priority     = 1;
        this.createdAt    = LocalDateTime.now();
        this.kanbanStatus = "TODO";
    }

    // ── Getters ──────────────────────────────────────────────

    public Long getId()                  { return id; }
    public Long getGoalId()              { return goalId; }
    public String getTaskName()          { return taskName; }
    public boolean isCompleted()         { return completed; }
    public Integer getPriority()         { return priority; }
    public String getStatus()            { return status; }
    public String getKanbanStatus()      { return kanbanStatus; }
    public LocalDateTime getCreatedAt()  { return createdAt; }
    public LocalDateTime getCompletedAt(){ return completedAt; }

    // ── Setters ──────────────────────────────────────────────

    public void setId(Long id)                          { this.id = id; }
    public void setGoalId(Long goalId)                  { this.goalId = goalId; }
    public void setTaskName(String taskName)            { this.taskName = taskName; }
    public void setPriority(Integer priority)           { this.priority = priority; }
    public void setStatus(String status)                { this.status = status; }
    public void setKanbanStatus(String kanbanStatus)    { this.kanbanStatus = kanbanStatus; }
    public void setCreatedAt(LocalDateTime createdAt)   { this.createdAt = createdAt; }
    public void setCompletedAt(LocalDateTime completedAt){ this.completedAt = completedAt; }

    public void setCompleted(boolean completed) {
        this.completed = completed;

        if (completed) {
            this.status       = "COMPLETED";
            this.completedAt  = LocalDateTime.now();
            this.kanbanStatus = "DONE";      // keep Kanban in sync
        } else {
            this.status       = "PENDING";
            this.completedAt  = null;
            this.kanbanStatus = "TODO";      // reset to TODO when un-checked
        }
    }
}