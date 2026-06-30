package promptpal.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import promptpal.backend.dto.ProfileUpdateRequest;
import promptpal.backend.entity.User;
import promptpal.backend.entity.WellnessScore;
import promptpal.backend.repository.UserRepository;

import java.util.Optional;

@Service
public class UserProfileService {

	private static final int MIN_ROUTINE_LENGTH = 10;
    private final UserRepository userRepository;

    @Autowired
    public UserProfileService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Auto-generated wellness scores when profile updates
    @Autowired
    private WellnessScoreService wellnessScoreService;

    public User updateProfile(Long userId, ProfileUpdateRequest request) {

        Optional<User> userOpt = userRepository.findById(userId);

        if (userOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found with ID: " + userId);
        }

        if (request.getDailyRoutine() != null &&
        	    !request.getDailyRoutine().isBlank() &&
        	    request.getDailyRoutine().length() < 10) {

        	    throw new ResponseStatusException(
        	            HttpStatus.BAD_REQUEST,
        	            "Daily routine must be at least 10 characters."
        	    );
        	}

        User user = userOpt.get();
        user.setPhone(request.getPhone());

        user.setHairGoals(request.getHairGoals());

        user.setHairConcerns(request.getHairConcerns());
        
        user.setSkinConcerns(request.getSkinConcerns());

        // 1. Health Metrics
        user.setAge(request.getAge());
        user.setWeight(request.getWeight());
        user.setHeight(request.getHeight());
        user.setAllergies(request.getAllergies());
        user.setDailyRoutine(request.getDailyRoutine());

        // 2. Wellness Goals
        user.setSkinType(request.getSkinType());
        user.setHairType(request.getHairType());
        user.setBodyGoal(request.getBodyGoal());

        // 3. Wellness Scores (FIXED)
        user.setSkinConcernLevel(request.getSkinConcernLevel());
        user.setHairConcernLevel(request.getHairConcernLevel());
        user.setDietScore(request.getDietScore());
        user.setExerciseScore(request.getExerciseScore());
        user.setSleepHours(request.getSleepHours());

        // Save user, then auto-generate wellness score
        User savedUser = userRepository.save(user);

        System.out.println("PROFILE SAVED SUCCESSFULLY");
        System.out.println("USER ID = " + savedUser.getId());

        try {

            WellnessScore ws =
                    wellnessScoreService.generateWellnessScore(savedUser);

            System.out.println("WELLNESS SCORE SAVED");
            System.out.println("TOTAL SCORE = " + ws.getTotalScore());

        } catch (Exception e) {

            System.out.println("ERROR SAVING WELLNESS SCORE");

            e.printStackTrace();
        }

        return savedUser;

       
    }

    public User getProfile(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found with ID: " + userId)
                );
    }
}