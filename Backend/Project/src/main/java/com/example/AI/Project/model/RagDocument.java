package com.example.AI.Project.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "rag_documents")
public class RagDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false)
    private String fileType;   // PDF, DOCX, TXT

    @Column(nullable = false)
    private int chunkCount;

    @Column(nullable = false)
    private LocalDateTime uploadedAt = LocalDateTime.now();

    // Vector store stores chunks separately; we track metadata here
    @Column(nullable = false)
    private String vectorNamespace;  // e.g. "user_42_doc_7" for filtering

    public RagDocument() {}

    public Long getId() { return id; }
    public User getUser() { return user; }
    public String getFileName() { return fileName; }
    public String getFileType() { return fileType; }
    public int getChunkCount() { return chunkCount; }
    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public String getVectorNamespace() { return vectorNamespace; }

    public void setId(Long id) { this.id = id; }
    public void setUser(User user) { this.user = user; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public void setFileType(String fileType) { this.fileType = fileType; }
    public void setChunkCount(int chunkCount) { this.chunkCount = chunkCount; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }
    public void setVectorNamespace(String vectorNamespace) { this.vectorNamespace = vectorNamespace; }
}