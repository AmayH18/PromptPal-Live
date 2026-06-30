package promptpal.backend.service;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RuleBasedSafetyEngine {

    private static final List<String> BANNED_KEYWORDS = List.of(
            "steroid",
            "extreme diet",
            "starvation",
            "medical cure",
            "supplement overdose"
    );

    public String applySafetyRules(String aiText) {

        String safeText = aiText;

        for (String banned : BANNED_KEYWORDS) {
            if (safeText.toLowerCase().contains(banned)) {
                safeText = safeText.replaceAll("(?i)" + banned, "[REMOVED]");
            }
        }

        return safeText;
    }

    public boolean isSafe(String aiText) {
        return BANNED_KEYWORDS.stream()
                .noneMatch(k -> aiText.toLowerCase().contains(k));
    }
}

