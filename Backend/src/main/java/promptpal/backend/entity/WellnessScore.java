package promptpal.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;

@Entity
@Table(name = "wellness_scores")
public class WellnessScore {

    // =====================================================
    // PRIMARY KEY
    // =====================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =====================================================
    // USER
    // =====================================================

    @Column(name = "user_id", nullable = false)
    private Long userId;

    // =====================================================
    // SCORE BREAKDOWN
    // =====================================================

    @Column(name = "skin_score")
    private int skinScore;

    @Column(name = "hair_score")
    private int hairScore;

    @Column(name = "sleep_score")
    private int sleepScore;

    @Column(name = "diet_score")
    private int dietScore;

    @Column(name = "exercise_score")
    private int exerciseScore;

    // =====================================================
    // TOTAL
    // =====================================================

    @Column(name = "total_score")
    private int totalScore;

    // =====================================================
    // TIMESTAMP
    // =====================================================

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // =====================================================
    // AUTO TIMESTAMP
    // =====================================================

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    // =====================================================
    // CONSTRUCTORS
    // =====================================================

    public WellnessScore() {
    }

    // =====================================================
    // GETTERS & SETTERS
    // =====================================================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public int getSkinScore() {
        return skinScore;
    }

    public void setSkinScore(int skinScore) {
        this.skinScore = skinScore;
    }

    public int getHairScore() {
        return hairScore;
    }

    public void setHairScore(int hairScore) {
        this.hairScore = hairScore;
    }

    public int getSleepScore() {
        return sleepScore;
    }

    public void setSleepScore(int sleepScore) {
        this.sleepScore = sleepScore;
    }

    public int getDietScore() {
        return dietScore;
    }

    public void setDietScore(int dietScore) {
        this.dietScore = dietScore;
    }

    public int getExerciseScore() {
        return exerciseScore;
    }

    public void setExerciseScore(int exerciseScore) {
        this.exerciseScore = exerciseScore;
    }

    public int getTotalScore() {
        return totalScore;
    }

    public void setTotalScore(int totalScore) {
        this.totalScore = totalScore;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}