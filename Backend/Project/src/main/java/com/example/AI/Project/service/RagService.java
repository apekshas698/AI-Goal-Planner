package com.example.AI.Project.service;

import com.example.AI.Project.model.RagChunk;
import com.example.AI.Project.repository.RagChunkRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RagService {

    private final RagChunkRepository ragChunkRepository;
    private final AIService          aiService;

    public RagService(RagChunkRepository ragChunkRepository, AIService aiService) {
        this.ragChunkRepository = ragChunkRepository;
        this.aiService          = aiService;
    }

    /**
     * Find the most relevant chunks for a question using TF-IDF keyword scoring,
     * then pass them as context to the LLM.
     *
     * @param question the user's question
     * @param userId   scope search to this user's documents only
     * @param docId    null = search all user docs, non-null = single document
     */
    public String answer(String question, Long userId, Long docId) {

        // 1. Load candidate chunks from MySQL
        List<RagChunk> candidates = (docId != null)
                ? ragChunkRepository.findByDocId(docId)
                : ragChunkRepository.findByUserId(userId);

        if (candidates.isEmpty()) {
            return "I couldn't find relevant information in your uploaded documents "
                    + "to answer that question. Try uploading a more relevant document first.";
        }

        // 2. Score each chunk against the question keywords
        List<String> questionTokens = tokenize(question);
        List<RagChunk> topChunks = candidates.stream()
                .sorted(Comparator.comparingDouble(
                        (RagChunk c) -> score(c.getContent(), questionTokens)).reversed())
                .limit(5)
                .collect(Collectors.toList());

        // 3. Build context string from top chunks
        String context = topChunks.stream()
                .map(c -> "---\n" + c.getContent() + "\n")
                .collect(Collectors.joining("\n"));

        // 4. Ask LLM to answer using only the context
        return aiService.answerWithContext(question, context);
    }

    // ── scoring ────────────────────────────────────────────────────────────

    /**
     * Simple TF-IDF-style score: counts how many question tokens appear in the chunk,
     * weighted by how rare they are across all chunks (inverse document frequency idea).
     */
    private double score(String chunkContent, List<String> questionTokens) {
        String lowerChunk = chunkContent.toLowerCase();
        double score = 0;
        for (String token : questionTokens) {
            if (token.length() < 3) continue;   // skip very short words
            long count = countOccurrences(lowerChunk, token);
            if (count > 0) {
                score += 1 + Math.log(count + 1);
            }
        }
        return score;
    }

    private long countOccurrences(String text, String word) {
        int count = 0;
        int idx   = 0;
        while ((idx = text.indexOf(word, idx)) != -1) {
            count++;
            idx += word.length();
        }
        return count;
    }

    private List<String> tokenize(String text) {
        // lowercase, split on non-alphanumeric, remove stopwords
        Set<String> stopWords = Set.of("the","a","an","is","are","was","were",
                "what","which","who","how","when","where","why","does","do",
                "did","in","on","at","to","for","of","and","or","but","with",
                "this","that","it","be","have","has","had","will","would",
                "can","could","should","may","might","about","from","by");

        return Arrays.stream(text.toLowerCase().split("[^a-z0-9]+"))
                .filter(t -> t.length() >= 3)
                .filter(t -> !stopWords.contains(t))
                .collect(Collectors.toList());
    }
}