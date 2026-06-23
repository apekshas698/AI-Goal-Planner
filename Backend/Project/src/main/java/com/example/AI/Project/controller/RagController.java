package com.example.AI.Project.controller;

import com.example.AI.Project.dto.RagDocumentDTO;
import com.example.AI.Project.model.RagDocument;
import com.example.AI.Project.model.User;
import com.example.AI.Project.repository.RagDocumentRepository;
import com.example.AI.Project.repository.UserRepository;
import com.example.AI.Project.service.DocumentIngestionService;
import com.example.AI.Project.service.RagService;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/rag")
public class RagController {

    private final DocumentIngestionService ingestionService;
    private final RagService ragService;
    private final RagDocumentRepository ragDocumentRepository;
    private final UserRepository userRepository;

    public RagController(DocumentIngestionService ingestionService,
                         RagService ragService,
                         RagDocumentRepository ragDocumentRepository,
                         UserRepository userRepository) {
        this.ingestionService = ingestionService;
        this.ragService = ragService;
        this.ragDocumentRepository = ragDocumentRepository;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // Upload a document
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public RagDocumentDTO uploadDocument(@RequestParam("file") MultipartFile file) {
        try {
            User user = getCurrentUser();
            RagDocument doc = ingestionService.ingest(file, user);
            return toDTO(doc);
        } catch (Exception e) {
            throw new RuntimeException("Failed to process document: " + e.getMessage(), e);
        }
    }

    // List user's uploaded documents
    @GetMapping("/documents")
    public List<RagDocumentDTO> listDocuments() {
        User user = getCurrentUser();
        return ragDocumentRepository.findByUserId(user.getId())
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // Delete a document
    @DeleteMapping("/documents/{id}")
    public Map<String, String> deleteDocument(@PathVariable Long id) {
        User user = getCurrentUser();
        ingestionService.deleteDocument(id, user);
        return Map.of("message", "Document deleted");
    }

    // Ask a question — optionally scoped to one document
    @PostMapping("/ask")
    public Map<String, String> askQuestion(@RequestBody Map<String, Object> body) {
        String question = (String) body.get("question");
        Long docId = body.get("docId") != null
                ? Long.valueOf(body.get("docId").toString())
                : null;

        if (question == null || question.isBlank()) {
            throw new RuntimeException("Question is required");
        }

        User user = getCurrentUser();
        String answer = ragService.answer(question, user.getId(), docId);
        return Map.of("answer", answer);
    }

    private RagDocumentDTO toDTO(RagDocument doc) {
        return new RagDocumentDTO(
                doc.getId(),
                doc.getFileName(),
                doc.getFileType(),
                doc.getChunkCount(),
                doc.getUploadedAt()
        );
    }
}