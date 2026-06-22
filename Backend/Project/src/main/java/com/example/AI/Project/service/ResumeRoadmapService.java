package com.example.AI.Project.service;

import com.example.AI.Project.dto.ResumeRoadmapDTO;
import org.springframework.stereotype.Service;

@Service
public class ResumeRoadmapService {

    private final AIService aiService;

    public ResumeRoadmapService(AIService aiService) {
        this.aiService = aiService;
    }

    public ResumeRoadmapDTO generateRoadmaps(String target) {
        ResumeRoadmapDTO dto = new ResumeRoadmapDTO();
        dto.setTarget(target);

        dto.setDsaRoadmap(aiService.generateResumeSection(target, "DSA",
                "Data Structures & Algorithms topics, problems, and milestones"));

        dto.setSystemDesignRoadmap(aiService.generateResumeSection(target, "System Design",
                "System Design concepts, case studies, and resources"));

        dto.setProjectsRoadmap(aiService.generateResumeSection(target, "Projects",
                "Project ideas with tech stack, complexity, and resume impact"));

        dto.setCsFundamentalsRoadmap(aiService.generateResumeSection(target, "CS Fundamentals",
                "OS, DBMS, Networks, OOP topics to master"));

        return dto;
    }
}