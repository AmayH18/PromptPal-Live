package promptpal.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import promptpal.backend.entity.KnowledgeChunk;

import java.util.List;

// ============================================================
// FIX: Added findByCategory() so RetrievalService can
//      pre-filter KB chunks by SKIN / HAIR / BODY before
//      doing cosine similarity — this is the root cause of
//      the AI ignoring knowledge base for the right category.
// ============================================================
public interface KnowledgeChunkRepository extends JpaRepository<KnowledgeChunk, String> {

    // Filter chunks by top-level category (SKIN, HAIR, BODY, GENERAL)
    List<KnowledgeChunk> findByCategory(String category);

    // Filter by category AND type — used for even more precise retrieval
    List<KnowledgeChunk> findByCategoryAndType(String category, String type);

    // Check if a specific chunk already exists (used in EmbeddingService to skip re-embedding)
    boolean existsById(String id);

    // Get all chunks that have an embedding stored (avoids NPE in cosine calc)
    @Query("SELECT k FROM KnowledgeChunk k WHERE k.embedding IS NOT NULL AND k.category = :category")
    List<KnowledgeChunk> findEmbeddedByCategory(@Param("category") String category);

    // Fallback: all embedded chunks regardless of category
    @Query("SELECT k FROM KnowledgeChunk k WHERE k.embedding IS NOT NULL")
    List<KnowledgeChunk> findAllEmbedded();
}
