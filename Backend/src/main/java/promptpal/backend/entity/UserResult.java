package promptpal.backend.entity;
import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * JPA Entity to store the AI-generated results for the user.
 */
@Entity
@Table(name = "user_results")

public class UserResult {
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String adviceType; // e.g., "SKIN", "HAIR", "BODY"

    @Column(columnDefinition = "TEXT", nullable = false)
    private String promptUsed; // The full, customized prompt sent to the AI

    @Column(columnDefinition = "TEXT", nullable = false)
    private String aiResponse; // The detailed advice received from the AI

    @Column(nullable = false)
    private LocalDateTime generationTime;
    @Column
    private Double accuracyScore;


    // --- Getters and Setters ---

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getAdviceType() {
        return adviceType;
    }

    public void setAdviceType(String adviceType) {
        this.adviceType = adviceType;
    }

    public String getPromptUsed() {
        return promptUsed;
    }

    public void setPromptUsed(String promptUsed) {
        this.promptUsed = promptUsed;
    }

    public String getAiResponse() {
        return aiResponse;
    }

    public void setAiResponse(String aiResponse) {
        this.aiResponse = aiResponse;
    }

    public LocalDateTime getGenerationTime() {
        return generationTime;
    }

    public void setGenerationTime(LocalDateTime generationTime) {
        this.generationTime = generationTime;
    }
    public Double getAccuracyScore() {
        return accuracyScore;
    }

    public void setAccuracyScore(Double accuracyScore) {
        this.accuracyScore = accuracyScore;
    }
}



