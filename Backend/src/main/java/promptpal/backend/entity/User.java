package promptpal.backend.entity;

import java.time.Instant;
import java.util.Collection;
import java.util.Collections;

import jakarta.persistence.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

@Entity
@Table(name = "users")
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false, unique = true)
    private String phone;

    @Column
    private Instant otpExpiry;

    @Column
    private int age;

    @Column
    private double height;

    @Column
    private double weight;

    @Column
    private String allergies;

    @Column(length = 500)
    private String dailyRoutine;

    // -------- WELLNESS GOALS --------

    @Column
    private String skinType;

    @Column
    private String hairType;
    
    @Column(length = 500)
    private String hairConcerns; // comma-separated: HAIR_FALL,DANDRUFF,DRYNESS,etc.

    @Column(length = 500)
    private String skinConcerns; // comma-separated: ACNE,PIGMENTATION,DRYNESS,etc.

    @Column(length = 500)
    private String hairGoals; // comma-separated: HAIR_GROWTH,THICKNESS,etc.

    @Column
    private String bodyGoal;

    // -------- WELLNESS SCORING INPUTS --------

    @Column
    private Integer skinConcernLevel;

    @Column
    private Integer hairConcernLevel;

    @Column
    private Integer sleepHours;

    @Column
    private Integer dietScore;

    @Column
    private Integer exerciseScore;

    // -------- OTP --------

    @Column
    private String otp;

    // -------- UserDetails overrides --------
    // These do NOT touch your DB schema — no new columns

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.emptyList();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    // -------- Getters and Setters --------

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    @Override
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    @Override
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public Instant getOtpExpiry() { return otpExpiry; }
    public void setOtpExpiry(Instant otpExpiry) { this.otpExpiry = otpExpiry; }

    public int getAge() { return age; }
    public void setAge(int age) { this.age = age; }

    public double getHeight() { return height; }
    public void setHeight(double height) { this.height = height; }

    public double getWeight() { return weight; }
    public void setWeight(double weight) { this.weight = weight; }

    public String getAllergies() { return allergies; }
    public void setAllergies(String allergies) { this.allergies = allergies; }

    public String getDailyRoutine() { return dailyRoutine; }
    public void setDailyRoutine(String dailyRoutine) { this.dailyRoutine = dailyRoutine; }

    public String getOtp() { return otp; }
    public void setOtp(String otp) { this.otp = otp; }

    public String getSkinType() { return skinType; }
    public void setSkinType(String skinType) { this.skinType = skinType; }

    public String getHairType() { return hairType; }
    public void setHairType(String hairType) { this.hairType = hairType; }
    
    public String getHairConcerns() { return hairConcerns; }
    public void setHairConcerns(String hairConcerns) { this.hairConcerns = hairConcerns; }

    public String getSkinConcerns() { return skinConcerns; }
    public void setSkinConcerns(String skinConcerns) { this.skinConcerns = skinConcerns; }

    public String getHairGoals() { return hairGoals; }
    public void setHairGoals(String hairGoals) { this.hairGoals = hairGoals; }

    public String getBodyGoal() { return bodyGoal; }
    public void setBodyGoal(String bodyGoal) { this.bodyGoal = bodyGoal; }

    public Integer getSkinConcernLevel() { return skinConcernLevel; }
    public void setSkinConcernLevel(Integer skinConcernLevel) { this.skinConcernLevel = skinConcernLevel; }

    public Integer getHairConcernLevel() { return hairConcernLevel; }
    public void setHairConcernLevel(Integer hairConcernLevel) { this.hairConcernLevel = hairConcernLevel; }

    public Integer getSleepHours() { return sleepHours; }
    public void setSleepHours(Integer sleepHours) { this.sleepHours = sleepHours; }

    public Integer getDietScore() { return dietScore; }
    public void setDietScore(Integer dietScore) { this.dietScore = dietScore; }

    public Integer getExerciseScore() { return exerciseScore; }
    public void setExerciseScore(Integer exerciseScore) { this.exerciseScore = exerciseScore; }
}