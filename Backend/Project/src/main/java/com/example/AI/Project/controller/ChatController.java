package com.example.AI.Project.controller;

import com.example.AI.Project.dto.ChatRequest;
import com.example.AI.Project.dto.ChatMessage;
import com.example.AI.Project.service.AIService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final AIService aiService;

    public ChatController(AIService aiService) {
        this.aiService = aiService;
    }

    @PostMapping
    public ChatMessage chat(@RequestBody ChatRequest request) {
        List<ChatMessage> messages = request.getMessages();

        String reply = aiService.chat(messages);

        return new ChatMessage("assistant", reply);
    }
}