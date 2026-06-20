package com.example.AI.Project.service;

import com.example.AI.Project.dto.AnalyticsDTO;
import com.example.AI.Project.dto.AnalyticsDTO.PriorityCount;
import com.example.AI.Project.dto.AnalyticsDTO.ProductivityPoint;
import com.example.AI.Project.dto.AnalyticsDTO.WeeklyProgressPoint;
import com.example.AI.Project.model.Goal;
import com.example.AI.Project.model.Task;
import com.example.AI.Project.repository.GoalRepository;
import com.example.AI.Project.repository.TaskRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final GoalRepository goalRepository;
    private final TaskRepository taskRepository;

    private static final DateTimeFormatter DAY_LABEL = DateTimeFormatter.ofPattern("dd MMM");
    private static final int MAX_WEEKS = 12;
    private static final int PRODUCTIVITY_WINDOW_DAYS = 14;

    public AnalyticsService(GoalRepository goalRepository, TaskRepository taskRepository) {
        this.goalRepository = goalRepository;
        this.taskRepository = taskRepository;
    }

    public AnalyticsDTO buildAnalytics(Long userId) {
        AnalyticsDTO dto = new AnalyticsDTO();

        List<Goal> goals = goalRepository.findByUserId(userId);
        List<Task> tasks = goals.stream()
                .flatMap(g -> taskRepository.findByGoalId(g.getId()).stream())
                .collect(Collectors.toList());

        int totalGoals = goals.size();
        long completedGoals = goals.stream().filter(g -> "COMPLETED".equals(g.getStatus())).count();
        dto.setTotalGoals(totalGoals);
        dto.setCompletedGoals((int) completedGoals);
        dto.setGoalSuccessRate(totalGoals == 0 ? 0 : (int) Math.round((completedGoals * 100.0) / totalGoals));

        int totalTasks = tasks.size();
        long completedTasks = tasks.stream().filter(Task::isCompleted).count();
        dto.setTotalTasks(totalTasks);
        dto.setCompletedTasks((int) completedTasks);
        dto.setTaskCompletionRate(totalTasks == 0 ? 0 : (int) Math.round((completedTasks * 100.0) / totalTasks));

        dto.setWeeklyProgress(buildWeeklyProgress(goals, tasks));
        dto.setProductivityTrend(buildProductivityTrend(tasks));
        dto.setPriorityBreakdown(buildPriorityBreakdown(tasks));

        return dto;
    }

    private List<WeeklyProgressPoint> buildWeeklyProgress(List<Goal> goals, List<Task> tasks) {
        List<WeeklyProgressPoint> points = new ArrayList<>();
        if (tasks.isEmpty() || goals.isEmpty()) return points;

        LocalDate earliestStart = goals.stream()
                .map(g -> g.getCreatedAt() != null ? g.getCreatedAt().toLocalDate() : LocalDate.now())
                .min(LocalDate::compareTo)
                .orElse(LocalDate.now());

        LocalDate today = LocalDate.now();
        long totalWeeks = Math.max(ChronoUnit.WEEKS.between(earliestStart, today) + 1, 1);
        long weeksToShow = Math.min(totalWeeks, MAX_WEEKS);
        LocalDate windowStart = today.minusWeeks(weeksToShow - 1);

        int totalTasks = tasks.size();

        for (int i = 0; i < weeksToShow; i++) {
            LocalDate weekEnd = windowStart.plusWeeks(i).plusDays(6);

            long completedByWeekEnd = tasks.stream()
                    .filter(Task::isCompleted)
                    .filter(t -> t.getCompletedAt() != null && !t.getCompletedAt().toLocalDate().isAfter(weekEnd))
                    .count();

            WeeklyProgressPoint point = new WeeklyProgressPoint();
            point.setWeekLabel("Week " + (i + 1));
            point.setCompletionPercent(totalTasks == 0 ? 0 : (int) Math.round((completedByWeekEnd * 100.0) / totalTasks));
            points.add(point);
        }

        return points;
    }

    private List<ProductivityPoint> buildProductivityTrend(List<Task> tasks) {
        List<ProductivityPoint> points = new ArrayList<>();
        LocalDate today = LocalDate.now();
        LocalDate start = today.minusDays(PRODUCTIVITY_WINDOW_DAYS - 1);

        Map<LocalDate, Long> completedByDay = tasks.stream()
                .filter(Task::isCompleted)
                .filter(t -> t.getCompletedAt() != null)
                .map(t -> t.getCompletedAt().toLocalDate())
                .filter(d -> !d.isBefore(start) && !d.isAfter(today))
                .collect(Collectors.groupingBy(d -> d, Collectors.counting()));

        for (int i = 0; i < PRODUCTIVITY_WINDOW_DAYS; i++) {
            LocalDate day = start.plusDays(i);
            ProductivityPoint point = new ProductivityPoint();
            point.setDateLabel(day.format(DAY_LABEL));
            point.setTasksCompleted(completedByDay.getOrDefault(day, 0L).intValue());
            points.add(point);
        }

        return points;
    }

    private List<PriorityCount> buildPriorityBreakdown(List<Task> tasks) {
        Map<String, Long> counts = tasks.stream()
                .filter(t -> t.getAiPriority() != null)
                .collect(Collectors.groupingBy(Task::getAiPriority, Collectors.counting()));

        List<PriorityCount> result = new ArrayList<>();
        for (String level : List.of("HIGH", "MEDIUM", "LOW")) {
            PriorityCount pc = new PriorityCount();
            pc.setPriority(level);
            pc.setCount(counts.getOrDefault(level, 0L).intValue());
            result.add(pc);
        }
        return result;
    }
}