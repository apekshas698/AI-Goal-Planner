package com.example.AI.Project.dto;

import java.time.LocalDateTime;

public class RagDocumentDTO {
    private Long id;
    private String fileName;
    private String fileType;
    private int chunkCount;
    private LocalDateTime uploadedAt;

    public RagDocumentDTO() {}

    public RagDocumentDTO(Long id, String fileName, String fileType,
                          int chunkCount, LocalDateTime uploadedAt) {
        this.id = id;
        this.fileName = fileName;
        this.fileType = fileType;
        this.chunkCount = chunkCount;
        this.uploadedAt = uploadedAt;
    }

    public Long getId() { return id; }
    public String getFileName() { return fileName; }
    public String getFileType() { return fileType; }
    public int getChunkCount() { return chunkCount; }
    public LocalDateTime getUploadedAt() { return uploadedAt; }

    public void setId(Long id) { this.id = id; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public void setFileType(String fileType) { this.fileType = fileType; }
    public void setChunkCount(int chunkCount) { this.chunkCount = chunkCount; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }
}