package promptpal.backend.service;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import promptpal.backend.entity.KnowledgeChunk;
import promptpal.backend.repository.KnowledgeChunkRepository;

import java.util.List;

// ============================================================
// CHANGES IN THIS FILE:
//
// OLD CODE: if (repo.count() > 0) return;
//   Problem: if only some chunks were embedded (e.g. server
//   crashed mid-init), it skips the rest permanently.
//
// FIX: Check per-chunk with existsById() so partial inits
//      are completed on the next startup.
//
// Also added per-chunk try-catch so one bad chunk doesn't
// abort the rest.
//
// All existing features are preserved.
// ============================================================
@Service
public class RAGInitializer {

    @Autowired
    private KnowledgeBaseLoader loader;

    @Autowired
    private EmbeddingService embeddingService;

    @Autowired
    private KnowledgeChunkRepository repo;

    @PostConstruct
    public void init() {
        try {
            List<KnowledgeChunk> chunks = loader.loadChunks();
            int embedded = 0;
            int skipped  = 0;

            for (KnowledgeChunk chunk : chunks) {
                // FIX: Per-chunk check instead of early-exit on total count
                if (repo.existsById(chunk.getId())) {
                    skipped++;
                    continue;
                }

                try {
                    List<Double> embedding = embeddingService.getEmbedding(chunk.getContent());

                    if (embedding == null || embedding.isEmpty()) {
                        System.err.println("[RAG INIT] Empty embedding for: " + chunk.getId() + " — skipping.");
                        continue;
                    }

                    chunk.setEmbedding(embedding.toString());
                    repo.save(chunk);
                    embedded++;
                    System.out.println("[RAG INIT] Saved chunk: " + chunk.getId()
                            + " [" + chunk.getCategory() + "]");

                } catch (Exception chunkEx) {
                    // FIX: One bad chunk doesn't block the rest
                    System.err.println("[RAG INIT] Failed for chunk " + chunk.getId()
                            + ": " + chunkEx.getMessage());
                }
            }

            System.out.println("✅ RAG Init complete. Embedded: " + embedded
                    + ", Already in DB: " + skipped);

        } catch (Exception e) {
            System.err.println("[RAG INIT ERROR] " + e.getMessage());
        }
    }
}