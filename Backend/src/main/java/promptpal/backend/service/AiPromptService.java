package promptpal.backend.service;

import org.springframework.stereotype.Service;
import promptpal.backend.entity.User;

@Service
public class AiPromptService {

    /* ===================== AGENT PROMPTS ===================== */

    public String skinAgentPrompt(User user) {
        return """
        You are a dermatologist AI.
        Provide safe skincare advice.
        Avoid medical claims and allergies.

        Skin Type: %s
        Allergies: %s
        Routine: %s
        """.formatted(
                safe(user.getSkinType()),
                safe(user.getAllergies()),
                safe(user.getDailyRoutine())
        );
    }

    public String hairAgentPrompt(User user) {
        return """
        You are a hair care expert AI.
        Suggest routine-based haircare advice.
        Avoid supplements and chemicals.
        Hair Type: %s
        Hair Concerns: %s
        Hair Goals: %s
        Routine: %s
        """.formatted(
            safe(user.getHairType()),
            safe(user.getHairConcerns()),
            safe(user.getHairGoals()),
            safe(user.getDailyRoutine())
        );
    }
    public String bodyAgentPrompt(User user) {
        return """
        You are a fitness and wellness AI.
        Suggest body advice.
        Avoid extreme diets.

        Age: %d
        Weight: %d
        Height: %d
        Goal: %s
        """.formatted(
                user.getAge(),
                user.getWeight(),
                user.getHeight(),
                safe(user.getBodyGoal())
        );
    }

    public String safetyAgentPrompt(String combined) {
        return """
        You are a safety validation AI.
        Remove unsafe, allergic, or extreme advice.

        INPUT:
        """ + combined;
    }

    public String summarizerPrompt(String safeText) {
        return """
        Merge all advice into ONE final response.
        Use sections:
        - Skin Care
        - Hair Care
        - Body & Fitness
        - Lifestyle Tips

        INPUT:
        """ + safeText;
    }

    private String safe(String value) {
        return value == null || value.isBlank() ? "Not provided" : value;
    }
}
