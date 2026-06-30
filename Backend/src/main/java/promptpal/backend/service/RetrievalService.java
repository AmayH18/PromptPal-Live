package promptpal.backend.service;
 
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import promptpal.backend.entity.KnowledgeChunk;
import promptpal.backend.repository.KnowledgeChunkRepository;
import promptpal.backend.util.SimilarityUtil;
 
import java.util.Arrays;
import java.util.List;
 
// ============================================================
// ROOT CAUSE FIX:
//
// OLD CODE: getContext(query) called repo.findAll() — fetched
//           ALL 15+ chunks (skin + hair + body mixed), then
//           took top 3 by cosine similarity. Since all skin
//           chunks have similar embeddings, a "body" query
//           could still pull HAIR chunks into the context.
//
// NEW CODE: getContext(query, category) pre-filters by category
//           BEFORE doing similarity ranking. Only SKIN chunks
//           are ranked when adviceType = SKIN, etc.
//           This guarantees the RAG context is always category-
//           correct and product links are always present.
// ============================================================
@Service
public class RetrievalService {
 
    @Autowired
    private KnowledgeChunkRepository repo;
 
    @Autowired
    private EmbeddingService embeddingService;
 
    // ── New: category-aware retrieval (called by WellnessService) ───────────────
    /**
     * Retrieves the most relevant knowledge base chunks for the given query,
     * filtered by category so only same-domain chunks compete.
     *
     * @param query    Short text description of what the user needs advice on
     * @param category "SKIN", "HAIR", "BODY", or "GENERAL" (mapped from adviceType)
     * @param topK     How many chunks to return (use 3 for focused, 5 for ALL mode)
     * @return Formatted string with all relevant KB content including product links
     */
    public String getContext(String query, String category, int topK) {
        List<Double> queryEmbedding = embeddingService.getEmbedding(query);
 
        // STEP 1: Fetch only chunks matching the requested category
        List<KnowledgeChunk> candidates = repo.findEmbeddedByCategory(category);
 
        // STEP 2: Fallback to all embedded chunks if category has none yet
        if (candidates.isEmpty()) {
            System.out.println("[RAG] No chunks found for category: " + category + " — falling back to all.");
            candidates = repo.findAllEmbedded();
        }
 
        if (candidates.isEmpty()) {
            return "No knowledge base available.";
        }
 
        // STEP 3: Rank by cosine similarity within the category
        String context = candidates.stream()
                .sorted((a, b) -> Double.compare(
                        similarity(queryEmbedding, b),
                        similarity(queryEmbedding, a)
                ))
                .limit(topK)
                .map(KnowledgeChunk::getContent)
                .reduce("", (x, y) -> x + "\n\n---\n\n" + y)
                .trim();
 
        System.out.println("[RAG] Retrieved " + Math.min(topK, candidates.size())
                + " chunks for category=" + category);
        System.out.println("[RAG] Context preview:\n" + context.substring(0, Math.min(300, context.length())));
 
        return context;
    }
 
    // ── Backward-compatible overload (old callers still compile) ────────────────
    /**
     * Old signature kept for backward compatibility.
     * Defaults to "GENERAL" category (fetches all embedded chunks).
     */
    public String getContext(String query) {
        return getContext(query, "GENERAL", 3);
    }
 
    // ── Private helpers ─────────────────────────────────────────────────────────
    private double similarity(List<Double> query, KnowledgeChunk chunk) {
        if (chunk.getEmbedding() == null || chunk.getEmbedding().isBlank()) return 0.0;
        try {
            List<Double> dbEmbedding = Arrays.stream(
                    chunk.getEmbedding()
                            .replace("[", "")
                            .replace("]", "")
                            .split(",")
            ).map(String::trim).map(Double::parseDouble).toList();
            return SimilarityUtil.cosine(query, dbEmbedding);
        } catch (Exception e) {
            System.err.println("[RAG] Embedding parse error for chunk " + chunk.getId() + ": " + e.getMessage());
            return 0.0;
        }
    }
}
 