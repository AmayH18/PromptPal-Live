package promptpal.backend.service;

import org.springframework.stereotype.Service;

@Service
public class ConfidenceScoringEngine {

    public double calculateConfidence(
            String skin,
            String hair,
            String body,
            String finalAdvice
    ) {

        int score = 0;

        if (skin != null && skin.length() > 100) score++;
        if (hair != null && hair.length() > 100) score++;
        if (body != null && body.length() > 100) score++;

        if (finalAdvice.contains("Skin")) score++;
        if (finalAdvice.contains("Hair")) score++;
        if (finalAdvice.contains("Body")) score++;

        return (score / 6.0) * 100;
    }
}
