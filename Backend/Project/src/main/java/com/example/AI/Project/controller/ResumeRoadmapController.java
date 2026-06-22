package com.example.AI.Project.controller;

import com.example.AI.Project.dto.ResumeRoadmapDTO;
import com.example.AI.Project.service.ResumeRoadmapService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/resume-roadmap")
public class ResumeRoadmapController {

    private final ResumeRoadmapService resumeRoadmapService;

    public ResumeRoadmapController(ResumeRoadmapService resumeRoadmapService) {
        this.resumeRoadmapService = resumeRoadmapService;
    }

    @PostMapping("/generate")
    public ResumeRoadmapDTO generate(@RequestBody Map<String, String> body) {
        String target = body.getOrDefault("target", "").trim();
        if (target.isEmpty()) {
            throw new RuntimeException("Target role is required");
        }
        return resumeRoadmapService.generateRoadmaps(target);
    }
}