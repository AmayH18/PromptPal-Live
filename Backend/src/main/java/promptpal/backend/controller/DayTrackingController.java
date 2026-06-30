package promptpal.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import promptpal.backend.entity.DayTracking;
import promptpal.backend.repository.UserRepository;
import promptpal.backend.repository.DayTrackingRepository;
import promptpal.backend.service.DayTrackingService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tracking")
public class DayTrackingController {

    @Autowired
    private DayTrackingService trackingService;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private DayTrackingRepository trackingRepo;

    private Long uid(UserDetails ud) {

        return userRepo.findByUsername(
                ud.getUsername()
        ).orElseThrow(() ->
                new RuntimeException("User not found")
        ).getId();
    }

    @GetMapping("/continue")
    public ResponseEntity<DayTracking> continueJourney(
            @AuthenticationPrincipal UserDetails ud,
            @RequestParam(name = "type", defaultValue = "ALL") String adviceType
    ) {

        String type =
                adviceType == null || adviceType.isBlank()
                        ? "ALL"
                        : adviceType.trim().toUpperCase();

        DayTracking latest =
                trackingRepo.findTopByUserIdAndAdviceTypeOrderByDayNumberDesc(
                        uid(ud),
                        type
                ).orElse(null);

        if (latest == null || latest.getDayNumber() >= 21) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(latest);
    }

    // ─────────────────────────────────────────────
    // START TRACKING
    // ─────────────────────────────────────────────

    @PostMapping("/start")
    public ResponseEntity<?> start(
            @AuthenticationPrincipal UserDetails ud,
            @RequestBody Map<String, Object> body
    ) {

        try {

            Long userResultId =
                    Long.valueOf(
                            body.get("userResultId").toString()
                    );

            String adviceType =
                    body.getOrDefault(
                            "adviceType",
                            "ALL"
                    ).toString();

            return ResponseEntity.ok(
                    trackingService.startTracking(
                            uid(ud),
                            userResultId,
                            adviceType
                    )
            );

        } catch (Exception e) {

            return ResponseEntity.badRequest().body(
                    Map.of(
                            "error",
                            e.getMessage()
                    )
            );
        }
    }

    // ─────────────────────────────────────────────
    // STATUS
    // ─────────────────────────────────────────────

    @GetMapping("/status")
    public ResponseEntity<?> status(
            @AuthenticationPrincipal UserDetails ud,
            @RequestParam(defaultValue = "ALL")
            String adviceType
    ) {

        return ResponseEntity.ok(
                trackingService.getStatus(
                        uid(ud),
                        adviceType
                )
        );
    }

    // ─────────────────────────────────────────────
    // SAVE STEPS
    // ─────────────────────────────────────────────

    @PostMapping("/save-steps")
    public ResponseEntity<?> saveSteps(
            @AuthenticationPrincipal UserDetails ud,
            @RequestBody Map<String, Object> body
    ) {

        try {

            int dayNumber =
                    Integer.parseInt(
                            body.get("dayNumber").toString()
                    );

            String adviceType =
                    body.getOrDefault(
                            "adviceType",
                            "ALL"
                    ).toString();

            List<String> steps =
                    body.get("completedSteps") != null
                            ? (List<String>) body.get("completedSteps")
                            : List.of();

            return ResponseEntity.ok(
                    trackingService.saveCompletedSteps(
                            uid(ud),
                            dayNumber,
                            adviceType,
                            steps
                    )
            );

        } catch (Exception e) {

            return ResponseEntity.badRequest().body(
                    Map.of(
                            "error",
                            e.getMessage()
                    )
            );
        }
    }

    // ─────────────────────────────────────────────
    // NEXT DAY
    // ─────────────────────────────────────────────

    @PostMapping("/next-day")
    public ResponseEntity<?> nextDay(
            @AuthenticationPrincipal UserDetails ud,
            @RequestBody Map<String, Object> body
    ) {

        try {

            String adviceType =
                    body.getOrDefault(
                            "adviceType",
                            "ALL"
                    ).toString();

            List<String> steps =
                    body.get("completedSteps") != null
                            ? (List<String>) body.get("completedSteps")
                            : List.of();

            return ResponseEntity.ok(
                    trackingService.generateNextDay(
                            uid(ud),
                            adviceType,
                            steps
                    )
            );

        } catch (RuntimeException e) {

            if (e.getMessage() != null &&
                    e.getMessage().contains("Subscription")) {

                return ResponseEntity.status(402).body(
                        Map.of(
                                "error", e.getMessage(),
                                "requiresSubscription", true
                        )
                );
            }

            return ResponseEntity.badRequest().body(
                    Map.of(
                            "error",
                            e.getMessage()
                    )
            );
        }
    }
}