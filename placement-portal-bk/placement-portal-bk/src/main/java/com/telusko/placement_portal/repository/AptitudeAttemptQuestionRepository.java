package com.telusko.placement_portal.repository;

import com.telusko.placement_portal.entity.AptitudeAttemptQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface AptitudeAttemptQuestionRepository extends JpaRepository<AptitudeAttemptQuestion, Long> {
    List<AptitudeAttemptQuestion> findAllByAttempt_IdOrderByPositionAsc(Long attemptId);
    Optional<AptitudeAttemptQuestion> findByIdAndAttempt_Id(Long id, Long attemptId);
}
