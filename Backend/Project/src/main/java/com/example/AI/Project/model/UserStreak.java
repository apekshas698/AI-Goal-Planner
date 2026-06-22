package com.example.AI.Project.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "user_streaks")
public class UserStreak {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "current_streak", nullable = false)
    private int currentStreak = 0;

    @Column(name = "longest_streak", nullable = false)
    private int longestStreak = 0;

    @Column(name = "last_activity_date")
    private LocalDate lastActivityDate;

    @Column(name = "streak_start_date")
    private LocalDate streakStartDate;

    @Column(name = "total_active_days", nullable = false)
    private int totalActiveDays = 0;

    public UserStreak() {}

    public UserStreak(User user) {
        this.user = user;
    }

    // Getters
    public Long getId() { return id; }
    public User getUser() { return user; }
    public int getCurrentStreak() { return currentStreak; }
    public int getLongestStreak() { return longestStreak; }
    public LocalDate getLastActivityDate() { return lastActivityDate; }
    public LocalDate getStreakStartDate() { return streakStartDate; }
    public int getTotalActiveDays() { return totalActiveDays; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setUser(User user) { this.user = user; }
    public void setCurrentStreak(int currentStreak) { this.currentStreak = currentStreak; }
    public void setLongestStreak(int longestStreak) { this.longestStreak = longestStreak; }
    public void setLastActivityDate(LocalDate lastActivityDate) { this.lastActivityDate = lastActivityDate; }
    public void setStreakStartDate(LocalDate streakStartDate) { this.streakStartDate = streakStartDate; }
    public void setTotalActiveDays(int totalActiveDays) { this.totalActiveDays = totalActiveDays; }
}