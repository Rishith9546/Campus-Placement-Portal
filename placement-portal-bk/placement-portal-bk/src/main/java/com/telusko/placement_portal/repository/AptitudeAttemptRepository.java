package com.telusko.placement_portal.repository;

import com.telusko.placement_portal.entity.AptitudeAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface AptitudeAttemptRepository extends JpaRepository<AptitudeAttempt, Long> {
    Optional<AptitudeAttempt> findFirstByStudent_IdAndStatusOrderByStartedAtDesc(Long studentId, AptitudeAttempt.Status status);
    List<AptitudeAttempt> findAllByStudent_IdAndStatusInOrderByStartedAtDesc(Long studentId, List<AptitudeAttempt.Status> statuses);
    List<AptitudeAttempt> findAllByStatusAndExpiresAtLessThanEqual(AptitudeAttempt.Status status, LocalDateTime expiresAt);
}
