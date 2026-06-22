package com.example.AI.Project.dto;

import java.util.List;

public class StreakDTO {

    private int currentStreak;
    private int longestStreak;
    private int totalActiveDays;
    private boolean activeToday;
    private String streakStatus;
    private List<String> badges;
    private String encouragement;

    // Getters
    public int getCurrentStreak() { return currentStreak; }
    public int getLongestStreak() { return longestStreak; }
    public int getTotalActiveDays() { return totalActiveDays; }
    public boolean isActiveToday() { return activeToday; }
    public String getStreakStatus() { return streakStatus; }
    public List<String> getBadges() { return badges; }
    public String getEncouragement() { return encouragement; }

    // Setters
    public void setCurrentStreak(int currentStreak) { this.currentStreak = currentStreak; }
    public void setLongestStreak(int longestStreak) { this.longestStreak = longestStreak; }
    public void setTotalActiveDays(int totalActiveDays) { this.totalActiveDays = totalActiveDays; }
    public void setActiveToday(boolean activeToday) { this.activeToday = activeToday; }
    public void setStreakStatus(String streakStatus) { this.streakStatus = streakStatus; }
    public void setBadges(List<String> badges) { this.badges = badges; }
    public void setEncouragement(String encouragement) { this.encouragement = encouragement; }
}