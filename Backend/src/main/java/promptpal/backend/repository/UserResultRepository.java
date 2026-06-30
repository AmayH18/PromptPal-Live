package promptpal.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import promptpal.backend.entity.UserResult;
import java.util.List;

public interface UserResultRepository extends JpaRepository<UserResult, Long> {

    /**
     * ✅ FIX: Removed findByUserIdOrderByGenerationTimeDesc — that method name is invalid
     * because UserResult has no direct "userId" field; it has a @ManyToOne "user" relation.
     *
     * The correct Spring Data JPA method is findByUser_Id... (uses underscore to traverse relation).
     * WellnessService.getHistory() has also been updated to use this method name.
     */
    List<UserResult> findByUser_IdOrderByGenerationTimeDesc(Long userId);
}

	


