package promptpal.backend.service;

import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import promptpal.backend.entity.User;
import promptpal.backend.entity.WellnessScore;
import promptpal.backend.repository.WellnessScoreRepository;

@Service
public class WellnessScoreService {

    @Autowired
    private WellnessScoreRepository repository;

    // =========================================================
    // MAIN METHOD
    // =========================================================

    public WellnessScore generateWellnessScore(User user) {

        System.out.println("Generating wellness score...");
        System.out.println("User ID: " + user.getId());

        int skinScore = calculateSkinScore(
                user.getSkinType(),
                user.getSkinConcerns()
        );

        int hairScore = calculateHairScore(
                user.getHairType(),
                user.getHairConcerns()
        );

        int sleepScore = calculateSleepScore(
                safe(user.getSleepHours())
        );

        int dietScore = calculateDietScore(
                safe(user.getDietScore())
        );

        int exerciseScore = calculateExerciseScore(
                safe(user.getExerciseScore())
        );

        int totalScore =
                skinScore +
                hairScore +
                sleepScore +
                dietScore +
                exerciseScore;

        System.out.println("Total Score = " + totalScore);

        WellnessScore score = new WellnessScore();

        score.setUserId(user.getId());

        score.setSkinScore(skinScore);
        score.setHairScore(hairScore);
        score.setSleepScore(sleepScore);
        score.setDietScore(dietScore);
        score.setExerciseScore(exerciseScore);

        score.setTotalScore(totalScore);

        

        return repository.save(score);
    }

    // =========================================================
    // SLEEP SCORE (25)
    // =========================================================

    public int calculateSleepScore(int sleepHours) {

        if (sleepHours >= 8) return 25;
        if (sleepHours == 7) return 20;
        if (sleepHours == 6) return 15;
        if (sleepHours == 5) return 10;

        return 5;
    }

    // =========================================================
    // SKIN SCORE (20)
    // =========================================================

    /**
     * Scoring is now based on profile attributes used in the UI:
     * - Base score from skin type (max 20)
     * - Penalties for each declared skin concern
     * - Hard floor at 10 so score never drops too low for multiple concerns
     */
    public int calculateSkinScore(String skinType, String skinConcerns) {

        int score = switch (normalize(skinType)) {
            case "NORMAL" -> 20;
            case "COMBINATION" -> 18;
            case "DRY" -> 16;
            case "OILY" -> 16;
            case "SENSITIVE" -> 14;
            default -> 15;
        };

        if (hasConcern(skinConcerns, "ACNE")) score -= 2;
        if (hasConcern(skinConcerns, "PIGMENTATION")) score -= 1;
        if (hasConcern(skinConcerns, "DARK_SPOTS")) score -= 1;
        if (hasConcern(skinConcerns, "DARK_CIRCLES")) score -= 1;
        if (hasConcern(skinConcerns, "DRYNESS")) score -= 1;
        if (hasConcern(skinConcerns, "SENSITIVITY")) score -= 2;
        if (hasConcern(skinConcerns, "FINE_LINES")) score -= 1;
        if (hasConcern(skinConcerns, "ACNE_SCARS")) score -= 1;

        return Math.max(score, 10);
    }

    // =========================================================
    // HAIR SCORE (20)
    // =========================================================

    /**
     * Hair scoring follows the same pattern as skin scoring:
     * - Base score from hair type (max 20)
     * - Penalties for listed hair concerns
     * - Hard floor at 10 for consistency in review/demo
     */
    public int calculateHairScore(String hairType, String hairConcerns) {

        int score = switch (normalize(hairType)) {
            case "STRAIGHT" -> 20;
            case "WAVY" -> 18;
            case "CURLY" -> 17;
            case "COILY" -> 16;
            default -> 16;
        };

        if (hasConcern(hairConcerns, "HAIR_FALL")) score -= 2;
        if (hasConcern(hairConcerns, "HAIR_THINNING")) score -= 2;
        if (hasConcern(hairConcerns, "DANDRUFF")) score -= 1;
        if (hasConcern(hairConcerns, "DRYNESS")) score -= 1;
        if (hasConcern(hairConcerns, "FRIZZ")) score -= 1;
        if (hasConcern(hairConcerns, "SPLIT_ENDS")) score -= 1;
        if (hasConcern(hairConcerns, "OILY_SCALP")) score -= 1;
        if (hasConcern(hairConcerns, "DRY_SCALP")) score -= 1;
        if (hasConcern(hairConcerns, "SCALP_ACNE")) score -= 2;

        return Math.max(score, 10);
    }

    // Backward-compatible overloads retained to avoid API breakage.
    public int calculateSkinScore(int level) {
        return calculateSkinScore(null, null);
    }

    public int calculateHairScore(int level) {
        return calculateHairScore(null, null);
    }

    // =========================================================
    // DIET SCORE (15)
    // =========================================================

    public int calculateDietScore(int level) {

        return switch (level) {

            case 3 -> 15;
            case 2 -> 10;

            default -> 5;
        };
    }

    // =========================================================
    // EXERCISE SCORE (20)
    // =========================================================

    public int calculateExerciseScore(int level) {

        return switch (level) {

            case 4 -> 20; // 5+ days
            case 3 -> 15; // 3-4 days
            case 2 -> 10; // 1-2 days

            default -> 5; // never
        };
    }

    // =========================================================
    // SAFE NULL HANDLING
    // =========================================================

    private int safe(Integer value) {
        return value == null ? 1 : value;
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim().toUpperCase();
    }

    /**
     * Checks exact concern tokens from comma-separated input,
     * so ACNE_SCARS does not accidentally match ACNE.
     */
    private boolean hasConcern(String concerns, String target) {
        if (concerns == null || concerns.isBlank()) {
            return false;
        }

        return Arrays.stream(concerns.split(","))
                .map(String::trim)
                .map(String::toUpperCase)
                .anyMatch(token -> token.equals(target));
    }

    // =========================================================
    // GET USER PROGRESS HISTORY
    // =========================================================

    public List<WellnessScore> getUserProgress(Long userId) {
        return repository.findByUserIdOrderByCreatedAtAsc(userId);
    }

    // =========================================================
    // GET LATEST SCORE
    // =========================================================

    public WellnessScore getLatestScore(Long userId) {

        List<WellnessScore> scores =
                repository.findByUserIdOrderByCreatedAtDesc(userId);

        if (scores.isEmpty()) {
            return null;
        }

        return scores.get(0);
    }
}