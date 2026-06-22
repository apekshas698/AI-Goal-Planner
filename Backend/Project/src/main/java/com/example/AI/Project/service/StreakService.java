package com.example.AI.Project.service;

import com.example.AI.Project.dto.StreakDTO;
import com.example.AI.Project.model.User;
import com.example.AI.Project.model.UserStreak;
import com.example.AI.Project.repository.UserStreakRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
public class StreakService {

    private final UserStreakRepository streakRepository;

    public StreakService(UserStreakRepository streakRepository) {
        this.streakRepository = streakRepository;
    }

    public UserStreak updateStreak(User user) {
        LocalDate today = LocalDate.now();

        UserStreak streak = streakRepository.findByUserId(user.getId())
                .orElseGet(() -> new UserStreak(user));

        LocalDate last = streak.getLastActivityDate();

        if (last == null) {
            streak.setCurrentStreak(1);
            streak.setLongestStreak(1);
            streak.setStreakStartDate(today);
            streak.setTotalActiveDays(1);
        } else {
            long daysSinceLast = ChronoUnit.DAYS.between(last, today);

            if (daysSinceLast == 0) {
                return streakRepository.save(streak);
            } else if (daysSinceLast == 1) {
                int newStreak = streak.getCurrentStreak() + 1;
                streak.setCurrentStreak(newStreak);
                if (newStreak > streak.getLongestStreak()) {
                    streak.setLongestStreak(newStreak);
                }
                streak.setTotalActiveDays(streak.getTotalActiveDays() + 1);
            } else {
                streak.setCurrentStreak(1);
                streak.setStreakStartDate(today);
                streak.setTotalActiveDays(streak.getTotalActiveDays() + 1);
            }
        }

        streak.setLastActivityDate(today);
        return streakRepository.save(streak);
    }

    public StreakDTO getStreakDTO(User user) {
        LocalDate today = LocalDate.now();

        UserStreak streak = streakRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    UserStreak s = new UserStreak(user);
                    return streakRepository.save(s);
                });

        StreakDTO dto = new StreakDTO();
        dto.setCurrentStreak(streak.getCurrentStreak());
        dto.setLongestStreak(streak.getLongestStreak());
        dto.setTotalActiveDays(streak.getTotalActiveDays());

        LocalDate last = streak.getLastActivityDate();
        boolean activeToday = last != null && last.equals(today);
        dto.setActiveToday(activeToday);

        if (streak.getCurrentStreak() == 0) {
            dto.setStreakStatus("BROKEN");
            dto.setEncouragement("Start your streak today!");
        } else if (last != null && ChronoUnit.DAYS.between(last, today) == 1) {
            dto.setStreakStatus("AT_RISK");
            dto.setEncouragement("Complete a task to keep your streak alive!");
        } else if (streak.getCurrentStreak() >= 7) {
            dto.setStreakStatus("ON_FIRE");
            dto.setEncouragement("You're on fire! Keep it up!");
        } else {
            dto.setStreakStatus("ACTIVE");
            dto.setEncouragement("Great consistency — keep going!");
        }

        dto.setBadges(computeBadges(streak.getCurrentStreak(), streak.getLongestStreak(), streak.getTotalActiveDays()));
        return dto;
    }

    private List<String> computeBadges(int current, int longest, int total) {
        List<String> badges = new ArrayList<>();

        if (longest >= 3)   badges.add("3-DAY_STREAK");
        if (longest >= 7)   badges.add("WEEK_WARRIOR");
        if (longest >= 14)  badges.add("FORTNIGHT_FIRE");
        if (longest >= 30)  badges.add("MONTHLY_MASTER");
        if (longest >= 60)  badges.add("60_DAY_LEGEND");
        if (longest >= 100) badges.add("CENTURY_CHAMPION");

        if (total >= 10)  badges.add("10_DAYS_ACTIVE");
        if (total >= 30)  badges.add("30_DAYS_ACTIVE");
        if (total >= 50)  badges.add("HALF_CENTURY");
        if (total >= 100) badges.add("CENTURION");

        return badges;
    }
}