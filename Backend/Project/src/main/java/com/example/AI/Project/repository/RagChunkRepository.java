package com.example.AI.Project.repository;

import com.example.AI.Project.model.RagChunk;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RagChunkRepository extends JpaRepository<RagChunk, Long> {

    // get all chunks for a specific document
    List<RagChunk> findByDocId(Long docId);

    // get all chunks belonging to a user (across all their documents)
    List<RagChunk> findByUserId(Long userId);

    // delete all chunks when a document is deleted
    void deleteByDocId(Long docId);
}