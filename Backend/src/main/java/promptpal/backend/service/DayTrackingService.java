package promptpal.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import promptpal.backend.entity.DayTracking;
import promptpal.backend.entity.User;
import promptpal.backend.entity.UserResult;
import promptpal.backend.repository.DayTrackingRepository;
import promptpal.backend.repository.UserRepository;
import promptpal.backend.repository.UserResultRepository;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class DayTrackingService {

    @Value("${app.tracker.test-mode:false}")
    private boolean testMode;

    @Autowired
    private DayTrackingRepository trackingRepo;

    @Autowired
    private UserResultRepository resultRepo;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private OpenAiClient openAiClient;

    @Autowired
    private RetrievalService retrievalService;

    private final ObjectMapper mapper = new ObjectMapper();

    // ─────────────────────────────────────────────
    // START TRACKING
    // ─────────────────────────────────────────────

    public Map<String, Object> startTracking(
            Long userId,
            Long userResultId,
            String adviceType
    ) {

        String type = normalize(adviceType);

        // ✅ ONLY ONE ACTIVE TRACKER PER TYPE
        List<DayTracking> existing =
                trackingRepo.findByUserIdAndAdviceTypeOrderByDayNumberAsc(
                        userId,
                        type
                );

        if (!existing.isEmpty()) {

            DayTracking latest =
                    existing.get(existing.size() - 1);

            if (latest.getDayNumber() < 21) {
                return buildStatus(userId, type);
            }
        }

        UserResult result =
                resultRepo.findById(userResultId)
                        .orElseThrow(() ->
                                new RuntimeException("Result not found"));

        DayTracking day1 = new DayTracking();

        day1.setUserId(userId);
        day1.setUserResultId(userResultId);
        day1.setAdviceType(type);

        day1.setDayNumber(1);

        day1.setProductsText(
                extractProductsText(result.getAiResponse())
        );

        day1.setRoutineText(
                extractDay1Routine(result.getAiResponse())
        );

        day1.setStartedAt(LocalDateTime.now());

        // TEST MODE - Unlock immediately when enabled
        day1.setNextDayUnlocksAt(
                testMode ? LocalDateTime.now() : LocalDateTime.now().plusHours(24)
        );

        trackingRepo.save(day1);

        return buildStatus(userId, type);
    }

    // ─────────────────────────────────────────────
    // STATUS
    // ─────────────────────────────────────────────

    public Map<String, Object> getStatus(
            Long userId,
            String adviceType
    ) {

        return buildStatus(
                userId,
                normalize(adviceType)
        );
    }

    // ─────────────────────────────────────────────
    // SAVE STEPS
    // ─────────────────────────────────────────────

    public Map<String, Object> saveCompletedSteps(
            Long userId,
            int dayNumber,
            String adviceType,
            List<String> completedSteps
    ) {

        String type = normalize(adviceType);

        DayTracking day =
                trackingRepo
                        .findByUserIdAndAdviceTypeAndDayNumber(
                                userId,
                                type,
                                dayNumber
                        )
                        .orElseThrow(() ->
                                new RuntimeException("Day not found"));

        try {

            day.setCompletedSteps(
                    mapper.writeValueAsString(
                            completedSteps != null
                                    ? completedSteps
                                    : List.of()
                    )
            );

        } catch (Exception e) {

            day.setCompletedSteps("[]");
        }

        trackingRepo.save(day);

        return Map.of("saved", true);
    }

    // ─────────────────────────────────────────────
    // GENERATE NEXT DAY
    // ─────────────────────────────────────────────

    public Map<String, Object> generateNextDay(
            Long userId,
            String adviceType,
            List<String> completedSteps
    ) {

        String type = normalize(adviceType);

        DayTracking latest =
                trackingRepo
                        .findTopByUserIdAndAdviceTypeOrderByDayNumberDesc(
                                userId,
                                type
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "No active session"
                                ));

        // ✅ SUBSCRIPTION GATE
        if (latest.getDayNumber() >= 21) {

            throw new RuntimeException(
                    "Subscription required to continue."
            );
        }

        User user =
                userRepo.findById(userId)
                        .orElseThrow(() ->
                                new RuntimeException("User not found"));

        int nextDay =
                latest.getDayNumber() + 1;

        String newRoutine;

        if (testMode) {

            String previousRoutine =
                    latest.getRoutineText() == null
                            ? ""
                            : latest.getRoutineText();

            newRoutine =
                    "Day " + nextDay + " Routine (Test Mode)\n\n"
                            + previousRoutine
                            + "\n\nThis routine is reused for testing to avoid OpenAI API usage.";

        } else {

            // ✅ BUILD RAG QUERY FROM USER PROFILE + TODAY'S CONTEXT
            String ragQuery = buildRagQuery(user, type, latest.getRoutineText(), completedSteps);

            // ✅ RETRIEVE RELEVANT KB SECTION (Category-filtered, not full KB)
            String category = mapAdviceTypeToCategory(type);
            int topK = "ALL".equals(type) ? 5 : 3;  // More chunks for ALL, focused for specific types
            String ragContext = retrievalService.getContext(ragQuery, category, topK);

            // ✅ BUILD OPTIMIZED PROMPT
            String prompt =
                    buildOptimizedPrompt(
                            user,
                            nextDay,
                            type,
                            latest.getProductsText(),
                            latest.getRoutineText(),
                            completedSteps
                    );

            // ✅ CALL OPENAI WITH RAG CONTEXT (grounded response, not hallucination)
            newRoutine =
                    openAiClient.getRagResponse(ragContext, prompt);
        }

        DayTracking next = new DayTracking();

        next.setUserId(userId);
        next.setUserResultId(latest.getUserResultId());
        next.setAdviceType(type);

        next.setDayNumber(nextDay);

        next.setProductsText(latest.getProductsText());

        next.setRoutineText(newRoutine);

        next.setStartedAt(LocalDateTime.now());

        // TEST MODE - Unlock immediately when enabled
        next.setNextDayUnlocksAt(
                testMode ? LocalDateTime.now() : LocalDateTime.now().plusHours(24)
        );

        trackingRepo.save(next);

        return buildStatus(userId, type);
    }

    // ─────────────────────────────────────────────
    // BUILD STATUS
    // ─────────────────────────────────────────────

    private Map<String, Object> buildStatus(
            Long userId,
            String type
    ) {

        List<DayTracking> days =
                trackingRepo
                        .findByUserIdAndAdviceTypeOrderByDayNumberAsc(
                                userId,
                                type
                        );

        if (days.isEmpty()) {

            return Map.of(
                    "hasActiveSession", false,
                    "adviceType", type
            );
        }

        DayTracking latest =
                days.get(days.size() - 1);

        boolean complete =
                latest.getDayNumber() >= 21;

        boolean canUnlock =
                !complete &&
                        (testMode ||
                        LocalDateTime.now().isAfter(
                                latest.getNextDayUnlocksAt()
                        ));

        List<Map<String, Object>> dayData =
                new ArrayList<>();

        for (DayTracking d : days) {

            List<String> completed =
                    new ArrayList<>();

            try {

                if (d.getCompletedSteps() != null) {

                    completed =
                            mapper.readValue(
                                    d.getCompletedSteps(),
                                    new TypeReference<>() {}
                            );
                }

            } catch (Exception ignored) {}

            Map<String, Object> map =
                    new HashMap<>();

            map.put("id", d.getId());
            map.put("dayNumber", d.getDayNumber());
            map.put("routineText", d.getRoutineText());
            map.put("productsText", d.getProductsText());
            map.put("completedSteps", completed);
            map.put("startedAt", d.getStartedAt());
            map.put("nextDayUnlocksAt", d.getNextDayUnlocksAt());

            dayData.add(map);
        }

        Map<String, Object> status =
                new HashMap<>();

        status.put("hasActiveSession", true);
        status.put("adviceType", type);

        status.put("currentDayNumber",
                latest.getDayNumber());

        status.put("totalDays", 21);

        status.put("progressPercentage",
                (latest.getDayNumber() * 100.0) / 21);

        status.put("canUnlockNextDay",
                canUnlock);

        status.put("isJourneyComplete",
                complete);

        status.put("requiresSubscription",
                complete);

        status.put("days", dayData);

        return status;
    }

    // ─────────────────────────────────────────────
    // UTILITIES
    // ─────────────────────────────────────────────

    private String normalize(String type) {

        return type == null
                ? "ALL"
                : type.toUpperCase().trim();
    }

    private String cleanJson(String raw) {

        if (raw == null) return "{}";

        return raw
                .replace("```json", "")
                .replace("```JSON", "")
                .replace("```", "")
                .trim();
    }

    private String extractProductsText(String json) {

        try {

            String cleaned = cleanJson(json);

            Map<String, Object> map =
                    mapper.readValue(
                            cleaned,
                            new TypeReference<>() {}
                    );

            List<Map<String, Object>> products =
                    (List<Map<String, Object>>) map.get("products");

            if (products == null) {
                return "No products";
            }

            StringBuilder sb =
                    new StringBuilder();

            for (Map<String, Object> p : products) {

                sb.append("- ")
                        .append(p.get("name"))
                        .append(" — ")
                        .append(p.get("use"))
                        .append("\n");
            }

            return sb.toString();

        } catch (Exception e) {

            return "No products";
        }
    }

    private String extractDay1Routine(String json) {

        try {

            String cleaned = cleanJson(json);

            Map<String, Object> map =
                    mapper.readValue(
                            cleaned,
                            new TypeReference<>() {}
                    );

            StringBuilder sb =
                    new StringBuilder();

            List<Map<String, Object>> sections =
                    (List<Map<String, Object>>) map.get("sections");

            if (sections != null) {

                for (Map<String, Object> sec : sections) {

                    sb.append(sec.get("heading"))
                            .append(":\n");

                    List<String> steps =
                            (List<String>) sec.get("steps");

                    if (steps != null) {

                        int i = 1;

                        for (String s : steps) {

                            sb.append(i++)
                                    .append(". ")
                                    .append(s)
                                    .append("\n");
                        }
                    }

                    sb.append("\n");
                }
            }

            return sb.toString();

        } catch (Exception e) {

            return "Routine unavailable";
        }
    }

    private String buildPrompt(
            int nextDay,
            String type,
            String products,
            String previousRoutine,
            List<String> completedSteps
    ) {

        String progress =
                completedSteps == null || completedSteps.isEmpty()
                        ? "User completed 0 steps yesterday. Simplify routine."
                        : "User completed:\n"
                        + String.join("\n", completedSteps);

        return """
You are PromptPal AI.

Generate ONLY plain text.

NO JSON.
NO MARKDOWN.

Today is Day %d of 21.

Advice Type: %s

Products:
%s

Previous Routine:
%s

Progress:
%s

Generate:
Morning Routine
Night Routine
Key Tips
"""
.formatted(
                nextDay,
                type,
                products,
                previousRoutine,
                progress
        );
    }

    // ─────────────────────────────────────────────
    // BUILD OPTIMIZED PROMPT (Day 2-21)
    // TOKEN-OPTIMIZED GENERATION
    // ─────────────────────────────────────────────

    private String buildOptimizedPrompt(
            User user,
            int nextDay,
            String type,
            String products,
            String previousRoutine,
            List<String> completedSteps
    ) {

        // Calculate BMI if height and weight are available
        String bmi = "Not provided";
        if (user.getHeight() > 0 && user.getWeight() > 0) {
            double heightM = user.getHeight() / 100.0;
            double bmiValue = user.getWeight() / (heightM * heightM);
            bmi = String.format("%.1f", bmiValue);
        }

        // Determine adherence level from completed steps
        String adherenceLevel = "medium";
        if (completedSteps != null && !completedSteps.isEmpty()) {
            int count = completedSteps.size();
            adherenceLevel = count >= 7 ? "high" : count >= 4 ? "medium" : "low";
        }

        // Build user profile block (once, reusable context)
        String userProfileBlock = String.format(
                "USER PROFILE (Reuse from Day 1):\n" +
                "- Age: %d | Height: %d cm | Weight: %d kg | BMI: %s\n" +
                "- Skin Type: %s | Hair Type: %s | Hair Concerns: %s\n" +
                "- Body Goal: %s | Sleep: %s hours\n" +
                "- Allergies: %s",
                user.getAge(),
                (int) user.getHeight(),
                (int) user.getWeight(),
                bmi,
                user.getSkinType() != null && !user.getSkinType().isBlank() ? user.getSkinType() : "Not provided",
                user.getHairType() != null && !user.getHairType().isBlank() ? user.getHairType() : "Not provided",
                user.getHairConcerns() != null && !user.getHairConcerns().isBlank() ? user.getHairConcerns() : "Not provided",
                user.getBodyGoal() != null && !user.getBodyGoal().isBlank() ? user.getBodyGoal() : "Not provided",
                user.getSleepHours() != null && user.getSleepHours() > 0 ? user.getSleepHours() : "Not provided",
                user.getAllergies() != null && !user.getAllergies().isBlank() ? user.getAllergies() : "None"
        );

        // Build progress block
        String progressBlock;
        if (completedSteps == null || completedSteps.isEmpty()) {
            progressBlock = "YESTERDAY'S PROGRESS: Low adherence — User skipped most steps. ADJUST: Simplify today's routine significantly.";
        } else {
            progressBlock = "YESTERDAY'S PROGRESS: " + adherenceLevel.toUpperCase() + " adherence — " +
                    completedSteps.size() + " steps completed. " +
                    (adherenceLevel.equals("high") ? "ADJUST: Slightly increase difficulty." :
                     adherenceLevel.equals("medium") ? "ADJUST: Maintain current difficulty." :
                     "ADJUST: Reduce complexity further.");
        }

        // Build prompt with all context (token-optimized)
        return switch (type) {

        case "SKIN" -> """
%s

PRODUCTS (Already generated on Day 1 — DO NOT REGENERATE):
%s

TODAY'S ROUTINE (Day %d of 21):

Previous Day:
%s

%s

INSTRUCTIONS:
- Generate ONLY today's skincare routine
- Include: Morning | Evening | Night | Today's Tips | Motivation
- Adapt based on yesterday's adherence
- Use only the provided products
- NO regeneration of products
- NO JSON, NO MARKDOWN, plain text only"""
                .formatted(userProfileBlock, products, nextDay, previousRoutine, progressBlock);

        case "HAIR" -> """
%s

PRODUCTS (Already generated on Day 1 — DO NOT REGENERATE):
%s

TODAY'S ROUTINE (Day %d of 21):

Previous Day:
%s

%s

INSTRUCTIONS:
- Generate ONLY today's haircare routine
- Include: Morning | Weekly Focus | Night | Today's Tips | Motivation
- Adapt based on yesterday's adherence
- Use only the provided products
- NO regeneration of products
- NO JSON, NO MARKDOWN, plain text only"""
                .formatted(userProfileBlock, products, nextDay, previousRoutine, progressBlock);

        case "BODY" -> """
%s

PRODUCTS (Already generated on Day 1 — DO NOT REGENERATE):
%s

TODAY'S ROUTINE (Day %d of 21):

Previous Day:
%s

%s

INSTRUCTIONS:
- Generate ONLY today's fitness & wellness routine
- Include: Meal Plan | Workout | Recovery | Today's Tips | Motivation
- Adapt based on yesterday's adherence
- Use only the provided products
- NO regeneration of products
- NO JSON, NO MARKDOWN, plain text only"""
                .formatted(userProfileBlock, products, nextDay, previousRoutine, progressBlock);

        default -> """
%s

PRODUCTS (Already generated on Day 1 — DO NOT REGENERATE):
%s

TODAY'S ROUTINE (Day %d of 21):

Previous Day:
%s

%s

INSTRUCTIONS:
- Generate ONLY today's complete wellness routine (skin + hair + body)
- Include for each: Morning | Today's Focus | Night | Tips | Motivation
- Keep each section brief (2-3 points max)
- Adapt based on yesterday's adherence
- Use only the provided products
- NO regeneration of products
- NO JSON, NO MARKDOWN, plain text only"""
                .formatted(userProfileBlock, products, nextDay, previousRoutine, progressBlock);
        };
    }

    // ─────────────────────────────────────────────
    // RAG QUERY BUILDER (Day 2-21)
    // ─────────────────────────────────────────────

    private String buildRagQuery(
            User user,
            String type,
            String previousRoutine,
            List<String> completedSteps
    ) {

        // Build a query that helps retrieve the most relevant KB sections
        // This query captures the user's context + today's challenge
        String adherenceNote = completedSteps == null || completedSteps.isEmpty()
                ? "low adherence, needs simpler routine"
                : "completed " + completedSteps.size() + " steps, ready for advancement";

        return switch (type) {

        case "SKIN" ->
                String.format(
                        "skincare for %s skin with %s concerns, user has %s, optimize routine",
                        user.getSkinType() != null ? user.getSkinType() : "normal",
                        user.getAllergies() != null ? user.getAllergies() : "no allergies",
                        adherenceNote
                );

        case "HAIR" ->
                String.format(
                        "haircare for %s hair, goals: %s, concerns: %s, user has %s",
                        user.getHairType() != null ? user.getHairType() : "normal",
                        user.getHairGoals() != null ? user.getHairGoals() : "general health",
                        user.getHairConcerns() != null ? user.getHairConcerns() : "maintenance",
                        adherenceNote
                );

        case "BODY" ->
                String.format(
                        "fitness and wellness for body goal %s, BMI %.1f, user has %s",
                        user.getBodyGoal() != null ? user.getBodyGoal() : "general health",
                        user.getHeight() > 0 && user.getWeight() > 0
                                ? user.getWeight() / ((user.getHeight() / 100.0) * (user.getHeight() / 100.0))
                                : 0,
                        adherenceNote
                );

        default ->
                String.format(
                        "complete wellness for skin %s, hair %s, body goal %s, user has %s",
                        user.getSkinType() != null ? user.getSkinType() : "normal",
                        user.getHairType() != null ? user.getHairType() : "normal",
                        user.getBodyGoal() != null ? user.getBodyGoal() : "general health",
                        adherenceNote
                );
        };
    }

    // ─────────────────────────────────────────────
    // MAP ADVICE TYPE TO KB CATEGORY
    // ─────────────────────────────────────────────

    private String mapAdviceTypeToCategory(String type) {

        return switch (type) {

        case "SKIN" -> "SKIN";

        case "HAIR" -> "HAIR";

        case "BODY" -> "BODY";

        default -> "GENERAL";
        };
    }
}