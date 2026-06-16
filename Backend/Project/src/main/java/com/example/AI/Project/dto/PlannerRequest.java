
package com.example.AI.Project.dto;

import java.util.List;

public class PlannerRequest {

    private String goal;
    private List<String> completedTasks;
    private List<String> pendingTasks;
    private int availableHours;

    public String getGoal() { return goal; }
    public void setGoal(String goal) { this.goal = goal; }

    public List<String> getCompletedTasks() { return completedTasks; }
    public void setCompletedTasks(List<String> completedTasks) { this.completedTasks = completedTasks; }

    public List<String> getPendingTasks() { return pendingTasks; }
    public void setPendingTasks(List<String> pendingTasks) { this.pendingTasks = pendingTasks; }

    public int getAvailableHours() { return availableHours; }
    public void setAvailableHours(int availableHours) { this.availableHours = availableHours; }
}