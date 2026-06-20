package com.example.AI.Project.dto;

public class DeadlinePredictionDTO {

    private boolean hasEnoughData;
    private boolean hasDeadline;
    private boolean hasTrackRecord;

    private int totalTasks;
    private int completedTasks;
    private int remainingTasks;

    private long daysElapsed;
    private double paceHoursPerDay;

    private int completionProbability;
    private String predictedFinishDate;

    private String deadlineDate;
    private Long daysLeftUntilDeadline;

    private String insight;

    public boolean isHasEnoughData() { return hasEnoughData; }
    public void setHasEnoughData(boolean hasEnoughData) { this.hasEnoughData = hasEnoughData; }

    public boolean isHasDeadline() { return hasDeadline; }
    public void setHasDeadline(boolean hasDeadline) { this.hasDeadline = hasDeadline; }

    public boolean isHasTrackRecord() { return hasTrackRecord; }
    public void setHasTrackRecord(boolean hasTrackRecord) { this.hasTrackRecord = hasTrackRecord; }

    public int getTotalTasks() { return totalTasks; }
    public void setTotalTasks(int totalTasks) { this.totalTasks = totalTasks; }

    public int getCompletedTasks() { return completedTasks; }
    public void setCompletedTasks(int completedTasks) { this.completedTasks = completedTasks; }

    public int getRemainingTasks() { return remainingTasks; }
    public void setRemainingTasks(int remainingTasks) { this.remainingTasks = remainingTasks; }

    public long getDaysElapsed() { return daysElapsed; }
    public void setDaysElapsed(long daysElapsed) { this.daysElapsed = daysElapsed; }

    public double getPaceHoursPerDay() { return paceHoursPerDay; }
    public void setPaceHoursPerDay(double paceHoursPerDay) { this.paceHoursPerDay = paceHoursPerDay; }

    public int getCompletionProbability() { return completionProbability; }
    public void setCompletionProbability(int completionProbability) { this.completionProbability = completionProbability; }

    public String getPredictedFinishDate() { return predictedFinishDate; }
    public void setPredictedFinishDate(String predictedFinishDate) { this.predictedFinishDate = predictedFinishDate; }

    public String getDeadlineDate() { return deadlineDate; }
    public void setDeadlineDate(String deadlineDate) { this.deadlineDate = deadlineDate; }

    public Long getDaysLeftUntilDeadline() { return daysLeftUntilDeadline; }
    public void setDaysLeftUntilDeadline(Long daysLeftUntilDeadline) { this.daysLeftUntilDeadline = daysLeftUntilDeadline; }

    public String getInsight() { return insight; }
    public void setInsight(String insight) { this.insight = insight; }
}