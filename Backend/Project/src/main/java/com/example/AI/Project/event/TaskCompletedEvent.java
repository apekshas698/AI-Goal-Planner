package com.example.AI.Project.event;

public class TaskCompletedEvent {

    private final Long goalId;

    public TaskCompletedEvent(Long goalId) {
        this.goalId = goalId;
    }

    public Long getGoalId() {
        return goalId;
    }
}