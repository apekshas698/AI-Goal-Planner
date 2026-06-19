package com.example.AI.Project.dto;

import java.util.List;

public class TaskPriorityResponseDTO {
    private List<TaskPriorityDTO> tasks;

    public List<TaskPriorityDTO> getTasks() { return tasks; }
    public void setTasks(List<TaskPriorityDTO> tasks) { this.tasks = tasks; }
}