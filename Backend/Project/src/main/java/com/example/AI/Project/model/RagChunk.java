package com.example.AI.Project.model;

import jakarta.persistence.*;

@Entity
@Table(name = "rag_chunks")
public class RagChunk {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // which document this chunk belongs to
    @Column(name = "doc_id", nullable = false)
    private Long docId;

    // which user owns it (for filtering)
    @Column(name = "user_id", nullable = false)
    private Long userId;

    // the actual text content of this chunk
    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    // position in the document (0, 1, 2 ...)
    @Column(name = "chunk_index")
    private int chunkIndex;

    public RagChunk() {}

    public RagChunk(Long docId, Long userId, String content, int chunkIndex) {
        this.docId      = docId;
        this.userId     = userId;
        this.content    = content;
        this.chunkIndex = chunkIndex;
    }

    public Long getId()          { return id; }
    public Long getDocId()       { return docId; }
    public Long getUserId()      { return userId; }
    public String getContent()   { return content; }
    public int getChunkIndex()   { return chunkIndex; }

    public void setId(Long id)                { this.id = id; }
    public void setDocId(Long docId)          { this.docId = docId; }
    public void setUserId(Long userId)        { this.userId = userId; }
    public void setContent(String content)    { this.content = content; }
    public void setChunkIndex(int chunkIndex) { this.chunkIndex = chunkIndex; }
}