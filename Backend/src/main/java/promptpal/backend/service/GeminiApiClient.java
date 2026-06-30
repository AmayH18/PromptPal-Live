package promptpal.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.List;
import java.util.Map;

/**
 * ✅ GeminiApiClient
 * Handles communication with Google Gemini AI API to fetch personalized wellness advice.
 * Uses WebClient (Spring WebFlux) for making HTTP POST requests.
 */

public class GeminiApiClient {



    private final WebClient webClient;
    private final String apiUrl;
    private final String apiKey;

    /**
     * Constructor-based dependency injection.
     * @param webClientBuilder WebClient builder from Spring context
     * @param apiUrl Gemini API URL (from application.properties)
     * @param apiKey Gemini API Key (from application.properties or environment)
     */
    public GeminiApiClient(
            WebClient.Builder webClientBuilder,
            @Value("${gemini.api.url}") String apiUrl,
            @Value("${gemini.api.key}") String apiKey) {

        this.apiUrl = apiUrl;
        this.apiKey = apiKey;

        

        // ✅ Build a WebClient instance that automatically appends the API key
        this.webClient = webClientBuilder
                .baseUrl(apiUrl + "?key=" + apiKey)
                .build();
    }

    /**
     * Sends a prompt to the Gemini API and returns a text-based AI response.
     * @param prompt The generated wellness prompt (from AiPromptService)
     * @return Clean AI advice text or error message.
     */
    public String getAdvice(String prompt) {
        // --- Step 1: Build JSON payload expected by Gemini ---
        Map<String, Object> part = Map.of("text", prompt);
        Map<String, Object> content = Map.of("parts", List.of(part));
        Map<String, Object> requestBody = Map.of("contents", List.of(content));
        System.out.println("===== GEMINI REQUEST =====");
        System.out.println(requestBody);
        System.out.println("API KEY LOADED = " + (apiKey != null && !apiKey.isBlank()));


        try {
            // --- Step 2: POST to Gemini API ---
            Map<String, Object> response = webClient.post()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(BodyInserters.fromValue(requestBody))
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block(); // blocking call for simplicity

            // --- Step 3: Extract the text response ---
            if (response != null && response.containsKey("candidates")) {
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");

                if (!candidates.isEmpty()) {
                    Map<String, Object> candidate = candidates.get(0);
                    Map<String, Object> contentMap = (Map<String, Object>) candidate.get("content");
                    List<Map<String, Object>> parts = (List<Map<String, Object>>) contentMap.get("parts");

                    if (!parts.isEmpty()) {
                        String text = (String) parts.get(0).get("text");
                        return text != null ? text.trim() : "⚠️ No text returned from AI.";
                    }
                }
            }
            System.out.println("===== GEMINI RAW RESPONSE =====");
            System.out.println(response);


            System.err.println("⚠️ Unexpected Gemini response structure: " + response);
            return "⚠️ Unexpected AI response format. Please try again later.";

        } catch (WebClientResponseException e) {
            // Handles API-level errors (invalid key, rate limits, etc.)
            System.err.println("❌ Gemini API Error " + e.getStatusCode() + ": " + e.getResponseBodyAsString());
            return "❌ Gemini API error: " + e.getStatusCode();
        } catch (Exception e) {
            // Handles network issues, parsing errors, etc.
            System.err.println("❌ General Gemini API error: " + e.getMessage());
            return "❌ Error: Could not connect to AI service.";
        }
    }
}
