package com.example.AI.Project.controller;

import com.example.AI.Project.dto.StreakDTO;
import com.example.AI.Project.model.User;
import com.example.AI.Project.repository.UserRepository;
import com.example.AI.Project.service.StreakService;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/streak")
public class StreakController {

    private final StreakService streakService;
    private final UserRepository userRepository;

    public StreakController(StreakService streakService, UserRepository userRepository) {
        this.streakService = streakService;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public StreakDTO getStreak() {
        return streakService.getStreakDTO(getCurrentUser());
    }

    @PostMapping("/ping")
    public StreakDTO ping() {
        User user = getCurrentUser();
        streakService.updateStreak(user);
        return streakService.getStreakDTO(user);
    }
}