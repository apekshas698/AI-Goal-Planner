package com.example.AI.Project.dto;

import java.util.List;

public class TaskResponseDTO {

    private List<TaskDTO> tasks;

    public List<TaskDTO> getTasks() {
        return tasks;
    }

    public void setTasks(List<TaskDTO> tasks) {
        this.tasks = tasks;
    }
}