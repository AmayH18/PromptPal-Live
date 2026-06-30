package promptpal.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.List;
import java.util.Map;

// ============================================================
// CHANGES IN THIS FILE:
//
// 1. max_tokens raised from 350 → 800 in getRagResponse().
//    WHY: The prompt now demands a structured response with
//    Routine + Tips + Products + 15-Day Plan + Avoid.
//    350 tokens was too short — the AI was cutting off before
//    reaching the Recommended Products section, which is why
//    products and links never appeared in the response.
//
// 2. System message in getRagResponse() rewritten to:
//    - Explicitly command the AI to use the knowledge base
//    - Explicitly command it to include product links
//    - Forbid outside knowledge / hallucination
//    - Keep temperature at 0.2 (down from 0.3) for precision
//
// 3. getAdvice() is UNCHANGED (backward compatibility).
// ============================================================
@Service
public class OpenAiClient {

    private final WebClient webClient;
    private final String model;
    private final int maxTokens;

    // ── System message used for RAG mode ───────────────────────────────────────
    // This is the critical fix: a weak system message let the AI ignore the KB.
    // Now it receives an explicit, non-negotiable instruction.
    private static final String RAG_SYSTEM_MESSAGE =
            "You are a wellness AI assistant for PromptPal — a personalized wellness app.\n\n"
            + "CRITICAL RULES — follow these without exception:\n"
            + "1. Use ONLY the knowledge base content provided in the user's message.\n"
            + "2. Do NOT use your own training knowledge for product recommendations.\n"
            + "3. Every product you mention MUST come from the knowledge base and MUST include its exact link.\n"
            + "4. Copy product links exactly as they appear — do not shorten, paraphrase, or invent links.\n"
            + "5. Follow the exact output format requested in the user's message.\n"
            + "6. If the knowledge base does not mention a product for a step, say "
            + "'[Use product from your local store]' — never invent a link.\n"
            + "7. Be specific and practical. No generic disclaimers. No filler.";

    public OpenAiClient(
            WebClient.Builder builder,
            @Value("${openai.api.key}") String apiKey,
            @Value("${openai.model:gpt-4o-mini}") String model,
            // FIX: 800 tokens gives the AI enough space to reach the Products section.
            // Previously 350 caused the response to be truncated before products appeared.
            @Value("${openai.max_tokens:800}") int maxTokens
    ) {
        this.model = model;
        this.maxTokens = maxTokens;
        this.webClient = builder
                .baseUrl("https://api.openai.com/v1")
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    /**
     * RAG-mode call: uses the strict system message that forces KB-only responses.
     * Called by WellnessService for all advice generation.
     *
     * @param ragContext  The retrieved knowledge base context (logged only — already embedded in prompt).
     * @param userPrompt  The fully assembled, type-specific prompt from WellnessService.
     * @return AI-generated advice text with products and links.
     */
    public String getRagResponse(String ragContext, String userPrompt) {
        System.out.println("===== CALLING OPENAI API (RAG Mode) =====");
        System.out.println("Model: " + model + " | max_tokens: " + maxTokens);

        Map<String, Object> request = Map.of(
                "model", model,
                "messages", List.of(
                        // FIX: Strict system message — no longer a weak "be focused" instruction
                        Map.of("role", "system", "content", RAG_SYSTEM_MESSAGE),
                        Map.of("role", "user",   "content", userPrompt)
                ),
                // FIX: temperature 0.2 (was 0.3) — lower = more faithful to KB
                "temperature", 0.2,
                // FIX: 800 tokens (was 350) — gives space for Products + links section
                "max_tokens", maxTokens
        );

        try {
            Map response = webClient.post()
                    .uri("/chat/completions")
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .timeout(Duration.ofSeconds(30))
                    .block();

            String content = (String)
                    ((Map)
                            ((Map)
                                    ((List) response.get("choices")).get(0))
                                    .get("message"))
                            .get("content");

            System.out.println("===== OPENAI RAG RESPONSE RECEIVED =====");
            System.out.println("Response length: " + (content != null ? content.length() : 0) + " chars");
            return content;

        } catch (Exception e) {
            System.err.println("OPENAI RAG ERROR: " + e.getMessage());
            return "AI wellness advice is temporarily unavailable. Please try again.";
        }
    }

    /**
     * Original simple advice method — UNCHANGED for backward compatibility.
     */
    public String getAdvice(String prompt) {
        System.out.println("===== CALLING OPENAI API =====");
        Map<String, Object> request = Map.of(
                "model", model,
                "messages", List.of(
                        Map.of("role", "system", "content", "You are an AI wellness advisor."),
                        Map.of("role", "user",   "content", prompt)
                ),
                "temperature", 0.2,
                "max_tokens", maxTokens
        );

        try {
            Map response = webClient.post()
                    .uri("/chat/completions")
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .timeout(Duration.ofSeconds(20))
                    .block();

            return (String)
                    ((Map)
                            ((Map)
                                    ((List) response.get("choices")).get(0))
                                    .get("message"))
                            .get("content");

        } catch (Exception e) {
            System.out.println("OPENAI ERROR: " + e.getMessage());
            return "AI wellness advice is temporarily unavailable.";
        }
    }
}