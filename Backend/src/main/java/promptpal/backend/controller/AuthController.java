package promptpal.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import java.security.Principal;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import promptpal.backend.entity.User;
import promptpal.backend.repository.UserRepository;
import promptpal.backend.security.JwtUtil;
import promptpal.backend.util.OtpGenerator;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import promptpal.backend.service.EmailService;


import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000") // React frontend
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private EmailService emailService;
    @Autowired
    private JwtUtil jwtUtil;

    
 // -------- GET PROFILE --------
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        user.setPassword(null);
        user.setOtp(null);
        return ResponseEntity.ok(user);
    }

    // -------- UPDATE PROFILE --------
    @PutMapping("/update-profile")
    public ResponseEntity<?> updateProfile(@AuthenticationPrincipal User user,
                                           @RequestBody User updatedData) {
        if (user == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        user.setPhone(updatedData.getPhone());
        user.setAge(updatedData.getAge());
        user.setHeight(updatedData.getHeight());
        user.setWeight(updatedData.getWeight());
        user.setSkinType(updatedData.getSkinType());
        user.setHairType(updatedData.getHairType());
        user.setSkinConcernLevel(updatedData.getSkinConcernLevel());
        user.setHairConcernLevel(updatedData.getHairConcernLevel());
        user.setSleepHours(updatedData.getSleepHours());
        user.setDietScore(updatedData.getDietScore());
        user.setExerciseScore(updatedData.getExerciseScore());
        user.setHairGoals(updatedData.getHairGoals());
        user.setHairConcerns(updatedData.getHairConcerns());
        user.setBodyGoal(updatedData.getBodyGoal());
        user.setAllergies(updatedData.getAllergies());
        user.setDailyRoutine(updatedData.getDailyRoutine());

        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Profile updated"));
    }




    // ----------- REGISTER ------------
    @PostMapping("/signup")
    public ResponseEntity<String> registerUser(@RequestBody User user) {
        if (userRepository.existsByUsername(user.getUsername()))
            return ResponseEntity.badRequest().body("❌ Username is already taken!");

        if (userRepository.existsByEmail(user.getEmail()))
            return ResponseEntity.badRequest().body("❌ Email is already registered!");

        if (userRepository.existsByPhone(user.getPhone()))
            return ResponseEntity.badRequest().body("❌ Phone number already registered!");

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
        return ResponseEntity.ok("✅ Registration successful!");
    }

    // ----------- LOGIN ------------
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody User loginData) {

        Optional<User> userOpt = userRepository.findByUsername(loginData.getUsername());
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("❌ Invalid username or password!");
        }

        User user = userOpt.get();

        if (!passwordEncoder.matches(loginData.getPassword(), user.getPassword())) {
            return ResponseEntity.badRequest().body("❌ Invalid username or password!");
        }

        String token = jwtUtil.generateToken(user.getUsername());

        return ResponseEntity.ok(Map.of(
                "token", token,
                "userId", user.getId(),
                "username", user.getUsername()
        ));
    }


       // ----------- FORGOT PASSWORD ------------
    

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody Map<String, String> request) {

        String email = request.get("email");

        System.out.println("🔍 Forgot password request received for: " + email);

        if (email == null || email.isEmpty()) {
            return ResponseEntity.badRequest().body("Email is required!");
        }

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Email not found!");
        }

        User user = userOpt.get();
        String otp = OtpGenerator.generateOtp();
        System.out.println("Generated OTP = " + otp);

        user.setOtp(otp);
        user.setOtpExpiry(Instant.now().plus(10, ChronoUnit.MINUTES));
        userRepository.save(user);

        boolean sent = emailService.sendOtpEmail(
                user.getEmail(),
                "Your Password Reset OTP",
                otp
        );
        System.out.println("📧 OTP Email Sent? " + sent);

        if (!sent) {
            return ResponseEntity.status(500).body("Failed to send OTP email!");
        }

        return ResponseEntity.ok("OTP sent to your email.");
    }



    // ----------- RESET PASSWORD ------------
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(
            @RequestParam String email,
            @RequestParam String otp,
            @RequestParam String newPassword) {

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Email not found!");
        }

        User user = userOpt.get();

        // 1. Check OTP match
        if (!otp.equals(user.getOtp())) {
            return ResponseEntity.badRequest().body("Invalid OTP!");
        }

        // 2. Check expiration
        if (user.getOtpExpiry() == null || Instant.now().isAfter(user.getOtpExpiry())) {
            return ResponseEntity.badRequest().body("OTP expired!");
        }

        // 3. Update password
        String hashed = passwordEncoder.encode(newPassword);
        user.setPassword(hashed);

        // 4. Clear OTP so it can't be reused
        user.setOtp(null);
        user.setOtpExpiry(null);

        userRepository.save(user);

        return ResponseEntity.ok("Password reset successfully!");
    }
}
