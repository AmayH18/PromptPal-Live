package promptpal.backend.dto;

public class ProfileUpdateRequest {

    // =====================================================
    // BASIC INFO
    // =====================================================

    private String phone;

    private int age;

    private double height;

    private double weight;

    private String allergies;

    private String dailyRoutine;

    // =====================================================
    // WELLNESS PROFILE
    // =====================================================

    private String skinType;
    
    private String skinConcerns;

    private String hairType;

    private String hairGoals;

    private String hairConcerns;

    private String bodyGoal;

    // =====================================================
    // WELLNESS SCORING
    // =====================================================

    private Integer skinConcernLevel;

    private Integer hairConcernLevel;

    private Integer dietScore;

    private Integer exerciseScore;

    private Integer sleepHours;

    // =====================================================
    // GETTERS & SETTERS
    // =====================================================

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }

    public double getHeight() {
        return height;
    }

    public void setHeight(double height) {
        this.height = height;
    }

    public double getWeight() {
        return weight;
    }

    public void setWeight(double weight) {
        this.weight = weight;
    }

    public String getAllergies() {
        return allergies;
    }

    public void setAllergies(String allergies) {
        this.allergies = allergies;
    }

    public String getDailyRoutine() {
        return dailyRoutine;
    }

    public void setDailyRoutine(String dailyRoutine) {
        this.dailyRoutine = dailyRoutine;
    }

    public String getSkinType() {
        return skinType;
    }

    public void setSkinType(String skinType) {
        this.skinType = skinType;
    }

    public String getSkinConcerns() {
        return skinConcerns;
    }

    public void setSkinConcerns(String skinConcerns) {
        this.skinConcerns = skinConcerns;
    }

    public String getHairType() {
        return hairType;
    }

    public void setHairType(String hairType) {
        this.hairType = hairType;
    }

    public String getHairGoals() {
        return hairGoals;
    }

    public void setHairGoals(String hairGoals) {
        this.hairGoals = hairGoals;
    }

    public String getHairConcerns() {
        return hairConcerns;
    }

    public void setHairConcerns(String hairConcerns) {
        this.hairConcerns = hairConcerns;
    }

    public String getBodyGoal() {
        return bodyGoal;
    }

    public void setBodyGoal(String bodyGoal) {
        this.bodyGoal = bodyGoal;
    }

    public Integer getSkinConcernLevel() {
        return skinConcernLevel;
    }

    public void setSkinConcernLevel(Integer skinConcernLevel) {
        this.skinConcernLevel = skinConcernLevel;
    }

    public Integer getHairConcernLevel() {
        return hairConcernLevel;
    }

    public void setHairConcernLevel(Integer hairConcernLevel) {
        this.hairConcernLevel = hairConcernLevel;
    }

    public Integer getDietScore() {
        return dietScore;
    }

    public void setDietScore(Integer dietScore) {
        this.dietScore = dietScore;
    }

    public Integer getExerciseScore() {
        return exerciseScore;
    }

    public void setExerciseScore(Integer exerciseScore) {
        this.exerciseScore = exerciseScore;
    }

    public Integer getSleepHours() {
        return sleepHours;
    }

    public void setSleepHours(Integer sleepHours) {
        this.sleepHours = sleepHours;
    }
}