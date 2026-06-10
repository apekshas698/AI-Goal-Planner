package com.example.AI.Project.controller;

import com.example.AI.Project.dto.*;
import com.example.AI.Project.model.User;
import com.example.AI.Project.repository.UserRepository;
import com.example.AI.Project.service.UserService;
import com.example.AI.Project.config.JwtUtil;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin("*")
public class AuthController {

    private final UserRepository repository;
    private final UserService userService;
    private final PasswordEncoder encoder;

    public AuthController(
            UserRepository repository,
            UserService userService,
            PasswordEncoder encoder) {

        this.repository = repository;
        this.userService = userService;
        this.encoder = encoder;
    }

    @PostMapping("/signup")
    public String signup(
            @RequestBody SignupRequest request) {

        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());

        userService.register(user);

        return "User Registered";
    }

    @PostMapping("/login")
    public AuthResponse login(
            @RequestBody LoginRequest request) {

        User user =
                repository.findByEmail(
                        request.getEmail()
                ).orElseThrow();

        boolean matches =
                encoder.matches(
                        request.getPassword(),
                        user.getPassword()
                );

        if (!matches) {
            throw new RuntimeException(
                    "Invalid Credentials"
            );
        }

        String token =
                JwtUtil.generateToken(
                        user.getEmail()
                );

        return new AuthResponse(token);
    }
}