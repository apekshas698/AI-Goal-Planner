package com.example.AI.Project.service;

import com.example.AI.Project.dto.DeadlinePredictionDTO;
import com.example.AI.Project.model.Goal;
import com.example.AI.Project.model.Task;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class PredictionService {

    private final AIService aiService;

    private static final double DEFAULT_TASK_HOURS = 2.0;
    private static final double FALLBACK_DAILY_PACE_HOURS = 1.0;
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd MMM yyyy");

    public PredictionService(AIService aiService) {
        this.aiService = aiService;
    }

    public DeadlinePredictionDTO predict(Goal goal, List<Task> tasks) {

        DeadlinePredictionDTO dto = new DeadlinePredictionDTO();

        int totalTasks = tasks.size();
        dto.setTotalTasks(totalTasks);

        if (totalTasks == 0) {
            dto.setHasEnoughData(false);
            dto.setInsight("Add some tasks to this goal to unlock deadline predictions.");
            return dto;
        }

        long completedTasks = tasks.stream().filter(Task::isCompleted).count();
        long remainingTasks = totalTasks - completedTasks;

        double completedHours = tasks.stream()
                .filter(Task::isCompleted)
                .mapToDouble(t -> t.getEstimatedHours() != null ? t.getEstimatedHours() : DEFAULT_TASK_HOURS)
                .sum();

        double remainingHours = tasks.stream()
                .filter(t -> !t.isCompleted())
                .mapToDouble(t -> t.getEstimatedHours() != null ? t.getEstimatedHours() : DEFAULT_TASK_HOURS)
                .sum();

        LocalDate startDate = goal.getCreatedAt() != null
                ? goal.getCreatedAt().toLocalDate()
                : LocalDate.now();

        LocalDate today = LocalDate.now();
        long daysElapsed = Math.max(ChronoUnit.DAYS.between(startDate, today), 1);

        boolean hasTrackRecord = completedTasks > 0;
        double paceHoursPerDay = hasTrackRecord ? completedHours / daysElapsed : 0;
        double effectivePace = hasTrackRecord ? paceHoursPerDay : FALLBACK_DAILY_PACE_HOURS;

        long predictedRemainingDays = remainingTasks == 0
                ? 0
                : (long) Math.ceil(remainingHours / effectivePace);

        LocalDate predictedFinishDate = today.plusDays(predictedRemainingDays);

        int probability;
        boolean hasDeadline = goal.getTargetDays() != null;

        if (hasDeadline) {
            LocalDate deadlineDate = startDate.plusDays(goal.getTargetDays());
            long daysLeftUntilDeadline = ChronoUnit.DAYS.between(today, deadlineDate);
            long bufferDays = daysLeftUntilDeadline - predictedRemainingDays;

            // Each day of buffer shifts probability ~4%, centered at 50% when buffer == 0
            double raw = 50 + (bufferDays * 4);
            probability = (int) Math.max(3, Math.min(97, raw));

            dto.setDeadlineDate(deadlineDate.format(DATE_FORMAT));
            dto.setDaysLeftUntilDeadline(daysLeftUntilDeadline);
        } else {
            // No fixed deadline: probability reflects confidence in the estimate itself
            double raw = 40 + (completedTasks * 6);
            probability = (int) Math.max(20, Math.min(95, raw));
        }

        dto.setHasEnoughData(true);
        dto.setHasDeadline(hasDeadline);
        dto.setHasTrackRecord(hasTrackRecord);
        dto.setCompletedTasks((int) completedTasks);
        dto.setRemainingTasks((int) remainingTasks);
        dto.setDaysElapsed(daysElapsed);
        dto.setPaceHoursPerDay(Math.round(paceHoursPerDay * 10) / 10.0);
        dto.setCompletionProbability(probability);
        dto.setPredictedFinishDate(predictedFinishDate.format(DATE_FORMAT));

        String insight = aiService.generateProgressInsight(
                goal.getTitle(),
                goal.getProgress() != null ? goal.getProgress() : 0,
                (int) completedTasks,
                totalTasks,
                dto.getPaceHoursPerDay(),
                dto.getPredictedFinishDate(),
                probability,
                hasDeadline ? dto.getDeadlineDate() : null
        );

        dto.setInsight(insight);

        return dto;
    }
}