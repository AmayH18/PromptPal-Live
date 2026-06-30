package promptpal.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import promptpal.backend.entity.DayTracking;
import promptpal.backend.entity.User;
import promptpal.backend.repository.DayTrackingRepository;
import promptpal.backend.repository.UserRepository;

import java.util.*;

@RestController
@RequestMapping("/api/tracking")
public class ActiveJourneysController {

    @Autowired
    private DayTrackingRepository trackingRepo;

    @Autowired
    private UserRepository userRepo;

    @GetMapping("/active-journeys")
    public ResponseEntity<List<Map<String, Object>>> getActiveJourneys(Authentication authentication) {

        Long userId = null;

        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof User) {
            userId = ((User) principal).getId();
        } else if (principal instanceof String) {
            // principal is likely the username
            String username = (String) principal;
            Optional<User> u = userRepo.findByUsername(username);
            if (u.isPresent()) userId = u.get().getId();
        }

        if (userId == null) {
            return ResponseEntity.status(401).build();
        }

        // Collect distinct advice types for this user by scanning all trackings for the user
        List<DayTracking> all = trackingRepo.findAll();

        Set<String> types = new LinkedHashSet<>();

        for (DayTracking d : all) {
            if (d.getUserId() != null && d.getUserId().equals(userId)) {
                types.add(d.getAdviceType());
            }
        }

        List<Map<String, Object>> result = new ArrayList<>();

        for (String type : types) {
            Map<String, Object> item = new HashMap<>();
            item.put("type", type);

            Optional<DayTracking> latestOpt = trackingRepo.findTopByUserIdAndAdviceTypeOrderByDayNumberDesc(userId, type);

            if (latestOpt.isPresent()) {
                DayTracking latest = latestOpt.get();
                int currentDay = latest.getDayNumber();
                boolean completed = currentDay >= 21;

                item.put("active", !completed);
                item.put("currentDay", currentDay);
                item.put("totalDays", 21);
                item.put("isCompleted", completed);
            } else {
                item.put("active", false);
            }

            result.add(item);
        }

        return ResponseEntity.ok(result);
    }
}
