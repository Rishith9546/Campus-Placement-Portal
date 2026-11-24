package com.telusko.placement_portal.repository;

import com.telusko.placement_portal.entity.AptitudeQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AptitudeQuestionRepository extends JpaRepository<AptitudeQuestion, Long> {
    List<AptitudeQuestion> findAllByActiveTrue();
}
