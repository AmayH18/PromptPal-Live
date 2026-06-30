package promptpal.backend.entity;

import jakarta.persistence.*;

// ============================================================
// FIX APPLIED TO THIS FILE:
//
// Added @Table(name = "knowledge_chunk") explicitly.
//
// WHY: EmbeddingService uses raw JDBC with:
//   "SELECT COUNT(*) FROM knowledge_chunk WHERE id = ?"
// and
//   "INSERT INTO knowledge_chunk (...) VALUES (...)"
//
// Without @Table, JPA auto-generates a table name.
// Different Hibernate versions generate different names
// (knowledge_chunk vs knowledge_chunks vs KnowledgeChunk).
// Locking it to "knowledge_chunk" here and in JDBC keeps them
// in sync regardless of Hibernate version.
//
// All other fields are UNCHANGED.
// ============================================================
@Entity
@Table(name = "knowledge_chunk")  // ← FIX: explicit table name
public class KnowledgeChunk {

    @Id
    private String id;

    private String category;

    private String type;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(columnDefinition = "LONGTEXT")
    private String embedding;

    // ── Getters and Setters (UNCHANGED) ─────────────────────────────────────────

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getEmbedding() { return embedding; }
    public void setEmbedding(String embedding) { this.embedding = embedding; }
}