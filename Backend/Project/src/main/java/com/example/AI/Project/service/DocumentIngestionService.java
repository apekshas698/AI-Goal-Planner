package com.example.AI.Project.service;

import com.example.AI.Project.model.RagChunk;
import com.example.AI.Project.model.RagDocument;
import com.example.AI.Project.model.User;
import com.example.AI.Project.repository.RagChunkRepository;
import com.example.AI.Project.repository.RagDocumentRepository;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DocumentIngestionService {

    private static final int CHUNK_SIZE    = 500;
    private static final int CHUNK_OVERLAP = 50;

    private final RagDocumentRepository ragDocumentRepository;
    private final RagChunkRepository    ragChunkRepository;

    public DocumentIngestionService(RagDocumentRepository ragDocumentRepository,
                                    RagChunkRepository ragChunkRepository) {
        this.ragDocumentRepository = ragDocumentRepository;
        this.ragChunkRepository    = ragChunkRepository;
    }

    public RagDocument ingest(MultipartFile file, User user) throws IOException {
        String fileName = file.getOriginalFilename();
        String fileType = detectFileType(fileName);
        String rawText  = extractText(file, fileType);

        List<String> chunks = chunkText(rawText, CHUNK_SIZE, CHUNK_OVERLAP);

        RagDocument doc = new RagDocument();
        doc.setUser(user);
        doc.setFileName(fileName);
        doc.setFileType(fileType);
        doc.setChunkCount(chunks.size());
        doc.setVectorNamespace("mysql");
        RagDocument saved = ragDocumentRepository.save(doc);

        for (int i = 0; i < chunks.size(); i++) {
            RagChunk chunk = new RagChunk(saved.getId(), user.getId(), chunks.get(i), i);
            ragChunkRepository.save(chunk);
        }

        return saved;
    }

    public void deleteDocument(Long docId, User user) {
        RagDocument doc = ragDocumentRepository.findById(docId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        if (!doc.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Not authorized");
        }

        ragChunkRepository.deleteByDocId(docId);
        ragDocumentRepository.delete(doc);
    }

    // ── helpers ────────────────────────────────────────────────────────────

    private String detectFileType(String fileName) {
        if (fileName == null) return "TXT";
        String lower = fileName.toLowerCase();
        if (lower.endsWith(".pdf"))  return "PDF";
        if (lower.endsWith(".docx")) return "DOCX";
        return "TXT";
    }

    private String extractText(MultipartFile file, String fileType) throws IOException {
        return switch (fileType) {
            case "PDF"  -> extractPdfText(file.getInputStream());
            case "DOCX" -> extractDocxText(file.getInputStream());
            default     -> new String(file.getBytes());
        };
    }

    private String extractPdfText(InputStream is) throws IOException {
        try (PDDocument pdDoc = Loader.loadPDF(is.readAllBytes())) {
            return new PDFTextStripper().getText(pdDoc);
        }
    }

    private String extractDocxText(InputStream is) throws IOException {
        try (XWPFDocument docx = new XWPFDocument(is)) {
            return docx.getParagraphs().stream()
                    .map(XWPFParagraph::getText)
                    .collect(Collectors.joining("\n"));
        }
    }

    private List<String> chunkText(String text, int chunkSize, int overlap) {
        List<String> chunks = new ArrayList<>();
        if (text == null || text.isBlank()) return chunks;

        // Normalize whitespace once — avoids holding two copies of the string
        String cleaned = text.replaceAll("\\s+", " ").trim();
        text = null; // allow GC of the original

        int length = cleaned.length();
        int start  = 0;

        while (start < length) {
            int end = Math.min(start + chunkSize, length);

            // Try to break at a sentence boundary
            if (end < length) {
                int lastPeriod = cleaned.lastIndexOf('.', end);
                if (lastPeriod > start + chunkSize / 2) {
                    end = lastPeriod + 1;
                }
            }

            String chunk = cleaned.substring(start, end).trim();
            if (!chunk.isBlank()) {
                chunks.add(chunk);
            }

            // ✅ KEY FIX: ensure start always moves forward to prevent infinite loop
            int nextStart = end - overlap;
            if (nextStart <= start) {
                nextStart = start + 1; // force progress
            }
            start = nextStart;
        }

        return chunks;
    }
}