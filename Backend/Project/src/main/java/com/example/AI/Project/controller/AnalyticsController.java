package com.example.AI.Project.controller;

import com.example.AI.Project.dto.AnalyticsDTO;
import com.example.AI.Project.model.User;
import com.example.AI.Project.repository.UserRepository;
import com.example.AI.Project.service.AnalyticsService;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final UserRepository userRepository;

    public AnalyticsController(AnalyticsService analyticsService, UserRepository userRepository) {
        this.analyticsService = analyticsService;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public AnalyticsDTO getAnalytics() {
        User user = getCurrentUser();
        return analyticsService.buildAnalytics(user.getId());
    }
}