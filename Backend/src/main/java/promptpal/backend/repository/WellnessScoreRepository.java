package promptpal.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import promptpal.backend.entity.WellnessScore;

@Repository
public interface WellnessScoreRepository extends JpaRepository<WellnessScore, Long> {

    List<WellnessScore> findByUserIdOrderByCreatedAtAsc(Long userId);

    List<WellnessScore> findByUserIdOrderByCreatedAtDesc(Long userId);

}