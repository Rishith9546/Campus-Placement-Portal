package com.telusko.placement_portal.repository;

import com.telusko.placement_portal.entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface JobRepo extends JpaRepository<Job, Long> {
    List<Job> findTop3ByRecruiterIdOrderByCreatedAtDesc(Long recruiterId);

    List<Job> findByRecruiterId(Long recruiterId);

    long countByRecruiterId(Long recruiterId);
    List<Job> findByRecruiterIdAndDeadlineGreaterThanEqual(
            Long recruiterId,
            LocalDate deadline
    );
    List<Job> findByRecruiterIdAndDeadlineLessThan(
            Long recruiterId,
            LocalDate deadline
    );

    @Query("""
    SELECT j FROM Job j
    WHERE j.recruiterId = :id
    AND (
        LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
        OR LOWER(j.skills) LIKE LOWER(CONCAT('%', :keyword, '%'))
        OR LOWER(j.location) LIKE LOWER(CONCAT('%', :keyword, '%'))
        OR LOWER(j.jobType) LIKE LOWER(CONCAT('%', :keyword, '%'))
    )
""")
    List<Job> searchJobsById(
            @Param("keyword") String keyword,
            @Param("id") Long id
    );
}
