package promptpal.backend.service;
 
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import promptpal.backend.entity.KnowledgeChunk;
 
import java.util.*;
import java.util.regex.*;
 
// ============================================================
// CHANGES IN THIS FILE:
//
// OLD CODE: Stored the entire section text as content.
//           The KnowledgeChunk.category was derived only from
//           the section ID prefix (e.g. SKIN_DRY → SKIN).
//           This was fine for simple cases but:
//           a) SCALP sections were mapped to "BODY" (wrong!)
//           b) The "type" field was underused
//
// FIX 1:   SCALP sections now correctly map to "HAIR"
//          (scalp is part of hair care, not body)
//
// FIX 2:   The content stored now explicitly starts with a
//          "CATEGORY:" header so the RAG context always
//          tells the AI what domain the chunk belongs to.
//          This prevents the AI from mixing skin advice
//          into a hair context window.
//
// FIX 3:   Added BODY_* mapping to handle all goal types
//          (BODY_WEIGHT_LOSS, BODY_MUSCLE_GAIN, etc.)
//
// All existing features (section parsing, chunk IDs, etc.)
// are preserved.
// ============================================================
@Service
public class KnowledgeBaseLoader {
 
    public List<KnowledgeChunk> loadChunks() throws Exception {
        ClassPathResource resource = new ClassPathResource("Knowledge_Base.txt");
        String fullText = new String(resource.getInputStream().readAllBytes());
 
        List<KnowledgeChunk> chunks = new ArrayList<>();
 
        Pattern pattern = Pattern.compile(
                "===\\s*(\\S+)\\s*===\\s*(.*?)(?====|\\z)",
                Pattern.DOTALL
        );
 
        Matcher matcher = pattern.matcher(fullText);
        while (matcher.find()) {
            String sectionId = matcher.group(1).trim();
            String rawContent = matcher.group(2).trim();
 
            // Skip empty sections
            if (rawContent.isBlank()) continue;
 
            String category = resolveCategory(sectionId);
            String type     = resolveType(sectionId);
 
            // FIX: Prepend a domain header so the LLM always knows what
            //      domain this chunk is from, even without seeing the section ID.
            String enrichedContent = "DOMAIN: " + category + " | SECTION: " + sectionId + "\n\n"
                    + rawContent;
 
            KnowledgeChunk chunk = new KnowledgeChunk();
            chunk.setId(sectionId);
            chunk.setCategory(category);
            chunk.setType(type);
            chunk.setContent(enrichedContent);
            chunks.add(chunk);
        }
 
        System.out.println("[RAG] Loaded " + chunks.size() + " chunks from Knowledge_Base.txt");
        chunks.forEach(c -> System.out.println("  → " + c.getId() + " [" + c.getCategory() + "]"));
        return chunks;
    }
 
    // ── Category resolver ──────────────────────────────────────────────────────
    private String resolveCategory(String id) {
        if (id.startsWith("SKIN")) return "SKIN";
 
        // FIX: SCALP sections belong to HAIR, not BODY
        if (id.startsWith("HAIR") || id.startsWith("SCALP")) return "HAIR";
 
        // FIX: All BODY_ variants now map correctly
        if (id.startsWith("BODY")) return "BODY";
 
        return "GENERAL";
    }
 
    // ── Type resolver ──────────────────────────────────────────────────────────
    private String resolveType(String id) {
        // e.g. SKIN_DRY → DRY, HAIR_GROWTH → GROWTH, BODY_WEIGHT_LOSS → WEIGHT_LOSS
        int underscoreIdx = id.indexOf('_');
        return underscoreIdx >= 0 ? id.substring(underscoreIdx + 1) : id;
    }
}