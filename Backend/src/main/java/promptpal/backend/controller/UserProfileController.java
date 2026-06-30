package promptpal.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import promptpal.backend.dto.ProfileUpdateRequest;
import promptpal.backend.entity.User;
import promptpal.backend.service.UserProfileService;

/**
 * REST controller for handling user wellness profile updates and retrievals.
 */
@RestController
@RequestMapping("/api/profile")
public class UserProfileController {

    private final UserProfileService profileService;

    @Autowired
    public UserProfileController(UserProfileService profileService) {
        this.profileService = profileService;
    }

    /**
     * Updates the complete user profile including health metrics and goals.
     * Uses PUT for complete replacement or update.
     *
     * @param userId The ID of the user whose profile is being updated.
     * @param request The profile data to save.
     * @return ResponseEntity with the updated user data (excluding password).
     */
    @PutMapping("/{userId}")
    public ResponseEntity<User> updateProfile(@PathVariable Long userId, @RequestBody ProfileUpdateRequest request) {
        // The service layer handles validation and exceptions (like 404/400)
        User updatedUser = profileService.updateProfile(userId, request);
        
        // Hide password hash before sending response
        updatedUser.setPassword(null); 
        updatedUser.setOtp(null);
        
        return ResponseEntity.ok(updatedUser);
    }
    
    /**
     * Retrieves the complete user profile.
     * @param userId The ID of the user.
     * @return ResponseEntity with the user's profile data.
     */
    @GetMapping("/{userId}")
    public ResponseEntity<User> getProfile(@PathVariable Long userId) {
        User user = profileService.getProfile(userId);
        
        // Hide password hash before sending response
        user.setPassword(null);
        user.setOtp(null);
        
        return ResponseEntity.ok(user);
    }
}

