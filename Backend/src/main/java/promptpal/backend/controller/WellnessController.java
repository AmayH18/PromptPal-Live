package promptpal.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import promptpal.backend.entity.User;
import promptpal.backend.entity.UserResult;
import promptpal.backend.repository.UserRepository;
import promptpal.backend.service.WellnessService;

import java.util.List;

@RestController
@RequestMapping("/api/wellness")
public class WellnessController {

    @Autowired
    private WellnessService wellnessService;

    @Autowired
    private UserRepository userRepository;


    // Generate AI Advice
    @PostMapping("/generate")
    public ResponseEntity<UserResult> generateAdvice(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "all") String adviceType) {

        System.out.println("===== WELLNESS AI ENDPOINT HIT =====");

        String username = userDetails.getUsername();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserResult result = wellnessService.generateAdvice(user.getId(), adviceType);

        return ResponseEntity.ok(result);
    }


    // Advice History
    @GetMapping("/history")
    public ResponseEntity<List<UserResult>> getHistory(
            @AuthenticationPrincipal UserDetails userDetails) {

        String username = userDetails.getUsername();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(
                wellnessService.getHistory(user.getId())
        );
    }
}