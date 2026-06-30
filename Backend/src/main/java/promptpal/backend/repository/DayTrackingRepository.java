package promptpal.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import promptpal.backend.entity.DayTracking;

import java.util.List;
import java.util.Optional;

public interface DayTrackingRepository extends JpaRepository<DayTracking, Long> {

    List<DayTracking> findByUserIdAndAdviceTypeOrderByDayNumberAsc(
            Long userId,
            String adviceType
    );

    Optional<DayTracking> findTopByUserIdAndAdviceTypeOrderByDayNumberDesc(
            Long userId,
            String adviceType
    );

    Optional<DayTracking> findByUserIdAndAdviceTypeAndDayNumber(
            Long userId,
            String adviceType,
            int dayNumber
    );
}