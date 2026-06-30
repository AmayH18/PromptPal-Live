package promptpal.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "day_tracking")
public class DayTracking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Long userResultId;

    @Column(nullable = false)
    private String adviceType;

    @Column(nullable = false)
    private int dayNumber;

    @Column(columnDefinition = "TEXT")
    private String productsText;       // Fixed product list extracted from Day 1 result

    @Column(columnDefinition = "TEXT")
    private String routineText;        // Plain-text routine for this day

    @Column(columnDefinition = "TEXT")
    private String completedSteps;     // JSON array of step strings user checked

    @Column(nullable = false)
    private LocalDateTime startedAt;

    @Column(nullable = false)
    private LocalDateTime nextDayUnlocksAt;  // startedAt + 24h

    // ── Getters & Setters ──────────────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getUserResultId() { return userResultId; }
    public void setUserResultId(Long userResultId) { this.userResultId = userResultId; }

    public String getAdviceType() { return adviceType; }
    public void setAdviceType(String adviceType) { this.adviceType = adviceType; }

    public int getDayNumber() { return dayNumber; }
    public void setDayNumber(int dayNumber) { this.dayNumber = dayNumber; }

    public String getProductsText() { return productsText; }
    public void setProductsText(String productsText) { this.productsText = productsText; }

    public String getRoutineText() { return routineText; }
    public void setRoutineText(String routineText) { this.routineText = routineText; }

    public String getCompletedSteps() { return completedSteps; }
    public void setCompletedSteps(String completedSteps) { this.completedSteps = completedSteps; }

    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }

    public LocalDateTime getNextDayUnlocksAt() { return nextDayUnlocksAt; }
    public void setNextDayUnlocksAt(LocalDateTime nextDayUnlocksAt) { this.nextDayUnlocksAt = nextDayUnlocksAt; }
}
