package promptpal.backend.dto;
import jakarta.validation.constraints.NotBlank;

public class AiAdviceRequest {

    // Must be one of: SKIN, HAIR, BODY
    @NotBlank(message = "Advice type cannot be blank.")
    private String adviceType;

    // --- Getters and Setters ---

    /**
     * Required getter method to retrieve the advice type.
     */
    public String getAdviceType() {
        return adviceType;
    }

    /**
     * Setter method for the advice type.
     */
    public void setAdviceType(String adviceType) {
        // Ensure the type is always uppercase for consistency in prompt generation
        this.adviceType = adviceType != null ? adviceType.toUpperCase() : null;
    }
}

