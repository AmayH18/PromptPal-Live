package promptpal.backend.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import promptpal.backend.repository.WellnessScoreRepository;
import promptpal.backend.entity.WellnessScore;

import java.util.List;

@RestController
@RequestMapping("/dashboard")
public class DashboardController {

 @Autowired
 private WellnessScoreRepository repository;

 @GetMapping("/score/{userId}")
 public WellnessScore getLatestScore(@PathVariable Long userId){

  List<WellnessScore> scores =
   repository.findByUserIdOrderByCreatedAtDesc(userId);

  if(scores.isEmpty()) return null;

  return scores.get(0);
 }

 @GetMapping("/progress/{userId}")
 public List<WellnessScore> getProgress(@PathVariable Long userId){

  return repository.findByUserIdOrderByCreatedAtAsc(userId);

 }

}
