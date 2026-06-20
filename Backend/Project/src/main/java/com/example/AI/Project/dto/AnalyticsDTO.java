package com.example.AI.Project.dto;

import java.util.List;

public class AnalyticsDTO {

    private int totalGoals;
    private int completedGoals;
    private int goalSuccessRate;

    private int totalTasks;
    private int completedTasks;
    private int taskCompletionRate;

    private List<WeeklyProgressPoint> weeklyProgress;
    private List<ProductivityPoint> productivityTrend;
    private List<PriorityCount> priorityBreakdown;

    public int getTotalGoals() { return totalGoals; }
    public void setTotalGoals(int totalGoals) { this.totalGoals = totalGoals; }

    public int getCompletedGoals() { return completedGoals; }
    public void setCompletedGoals(int completedGoals) { this.completedGoals = completedGoals; }

    public int getGoalSuccessRate() { return goalSuccessRate; }
    public void setGoalSuccessRate(int goalSuccessRate) { this.goalSuccessRate = goalSuccessRate; }

    public int getTotalTasks() { return totalTasks; }
    public void setTotalTasks(int totalTasks) { this.totalTasks = totalTasks; }

    public int getCompletedTasks() { return completedTasks; }
    public void setCompletedTasks(int completedTasks) { this.completedTasks = completedTasks; }

    public int getTaskCompletionRate() { return taskCompletionRate; }
    public void setTaskCompletionRate(int taskCompletionRate) { this.taskCompletionRate = taskCompletionRate; }

    public List<WeeklyProgressPoint> getWeeklyProgress() { return weeklyProgress; }
    public void setWeeklyProgress(List<WeeklyProgressPoint> weeklyProgress) { this.weeklyProgress = weeklyProgress; }

    public List<ProductivityPoint> getProductivityTrend() { return productivityTrend; }
    public void setProductivityTrend(List<ProductivityPoint> productivityTrend) { this.productivityTrend = productivityTrend; }

    public List<PriorityCount> getPriorityBreakdown() { return priorityBreakdown; }
    public void setPriorityBreakdown(List<PriorityCount> priorityBreakdown) { this.priorityBreakdown = priorityBreakdown; }

    public static class WeeklyProgressPoint {
        private String weekLabel;
        private int completionPercent;

        public String getWeekLabel() { return weekLabel; }
        public void setWeekLabel(String weekLabel) { this.weekLabel = weekLabel; }

        public int getCompletionPercent() { return completionPercent; }
        public void setCompletionPercent(int completionPercent) { this.completionPercent = completionPercent; }
    }

    public static class ProductivityPoint {
        private String dateLabel;
        private int tasksCompleted;

        public String getDateLabel() { return dateLabel; }
        public void setDateLabel(String dateLabel) { this.dateLabel = dateLabel; }

        public int getTasksCompleted() { return tasksCompleted; }
        public void setTasksCompleted(int tasksCompleted) { this.tasksCompleted = tasksCompleted; }
    }

    public static class PriorityCount {
        private String priority;
        private int count;

        public String getPriority() { return priority; }
        public void setPriority(String priority) { this.priority = priority; }

        public int getCount() { return count; }
        public void setCount(int count) { this.count = count; }
    }
}