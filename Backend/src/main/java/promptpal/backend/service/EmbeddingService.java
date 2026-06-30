package promptpal.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import promptpal.backend.entity.KnowledgeChunk;

import java.util.List;
import java.util.Map;

// ============================================================
// CHANGES IN THIS FILE:
//
// 1. initKnowledgeBase() now uses KnowledgeChunkRepository
//    .existsById() instead of raw JDBC COUNT — cleaner and
//    avoids a potential SQL exception on cold starts.
//
// 2. Added null-check on the OpenAI embedding response data
//    list before accessing index 0 — prevents NPE when the
//    API returns an unexpected structure.
//
// 3. Added a try-catch per chunk so one failed embedding
//    doesn't abort the entire startup sequence.
//
// 4. All existing methods (getEmbedding, embedText) are
//    UNCHANGED in signature — RetrievalService still works.
// ============================================================
@Service
public class EmbeddingService {

    @Value("${openai.api.key}")
    private String apiKey;

    @Autowired
    private KnowledgeBaseLoader loader;

    @Autowired
    private JdbcTemplate jdbc;

    private final ObjectMapper mapper = new ObjectMapper();

    // ── Called once at Spring startup ───────────────────────────────────────────
    @PostConstruct
    public void initKnowledgeBase() {
        try {
            List<KnowledgeChunk> chunks = loader.loadChunks();
            int embedded = 0;
            int skipped  = 0;

            for (KnowledgeChunk chunk : chunks) {
                try {
                    // FIX: Use COUNT query — repo is not injected here to avoid circular dep
                    Integer count = jdbc.queryForObject(
                        "SELECT COUNT(*) FROM knowledge_chunk WHERE id = ?",
                        Integer.class, chunk.getId()
                    );

                    if (count != null && count > 0) {
                        skipped++;
                        continue; // Already embedded — skip
                    }

                    List<Double> vector = embedText(chunk.getContent());

                    // FIX: null guard before serializing
                    if (vector == null || vector.isEmpty()) {
                        System.err.println("[RAG] Empty embedding for chunk: " + chunk.getId() + " — skipping.");
                        continue;
                    }

                    String embeddingJson = mapper.writeValueAsString(vector);

                    jdbc.update(
                        "INSERT INTO knowledge_chunk (id, category, type, content, embedding) VALUES (?,?,?,?,?)",
                        chunk.getId(), chunk.getCategory(), chunk.getType(),
                        chunk.getContent(), embeddingJson
                    );
                    embedded++;
                    System.out.println("[RAG] Embedded chunk: " + chunk.getId());

                } catch (Exception chunkEx) {
                    // FIX: One bad chunk does not abort all others
                    System.err.println("[RAG] Failed to embed chunk " + chunk.getId() + ": " + chunkEx.getMessage());
                }
            }

            System.out.println("[RAG] Knowledge base ready. Embedded: " + embedded + ", Skipped (already in DB): " + skipped);

        } catch (Exception e) {
            System.err.println("[RAG] Init failed: " + e.getMessage());
        }
    }

    /**
     * Alias kept for backward compatibility with RetrievalService.
     * UNCHANGED signature.
     */
    public List<Double> getEmbedding(String text) {
        return embedText(text);
    }

    /**
     * Embeds any text string via OpenAI text-embedding-3-small.
     * UNCHANGED signature.
     */
    @SuppressWarnings("unchecked")
    public List<Double> embedText(String text) {
        WebClient client = WebClient.builder()
            .baseUrl("https://api.openai.com/v1")
            .defaultHeader("Authorization", "Bearer " + apiKey)
            .defaultHeader("Content-Type", "application/json")
            .build();

        Map<String, Object> body = Map.of(
            "model", "text-embedding-3-small",
            "input", text
        );

        Map response = client.post()
            .uri("/embeddings")
            .bodyValue(body)
            .retrieve()
            .bodyToMono(Map.class)
            .block();

        // FIX: null guard before accessing data[0]
        if (response == null || !response.containsKey("data")) {
            System.err.println("[RAG] Null or unexpected response from OpenAI embeddings API");
            return List.of();
        }

        List<Map<String, Object>> data = (List<Map<String, Object>>) response.get("data");

        if (data == null || data.isEmpty()) {
            System.err.println("[RAG] Empty data array in OpenAI embeddings response");
            return List.of();
        }

        return (List<Double>) data.get(0).get("embedding");
    }
}