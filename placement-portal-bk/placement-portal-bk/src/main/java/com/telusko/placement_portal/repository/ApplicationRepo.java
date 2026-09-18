package com.telusko.placement_portal.repository;

import com.telusko.placement_portal.entity.application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepo extends JpaRepository<application, Long> {

    // Get applications of a particular student
    List<application> findByStudentId(Long studentId);

    // Get applications for a particular job
    List<application> findByJobId(Long jobId);

    // Check whether a student already applied for a particular job
    Optional<application> findByStudentIdAndJobId(
            Long studentId,
            Long jobId
    );

    // Count all applications for jobs posted by a recruiter
    @Query("""
        SELECT COUNT(a)
        FROM application a
        WHERE a.jobId IN (
            SELECT j.id
            FROM Job j
            WHERE j.recruiterId = :recruiterId
        )
    """)
    long countApplicationsByRecruiterId(
            @Param("recruiterId") Long recruiterId
    );

    // Count shortlisted applications for a recruiter
    @Query("""
        SELECT COUNT(a)
        FROM application a
        WHERE a.status = 'SHORTLISTED'
        AND a.jobId IN (
            SELECT j.id
            FROM Job j
            WHERE j.recruiterId = :recruiterId
        )
    """)
    long countShortlistedByRecruiterId(
            @Param("recruiterId") Long recruiterId
    );

    // Get shortlisted applications for a particular recruiter
    @Query("""
        SELECT a
        FROM application a
        WHERE a.status = 'SHORTLISTED'
        AND a.jobId IN (
            SELECT j.id
            FROM Job j
            WHERE j.recruiterId = :recruiterId
        )
    """)
    List<application> findShortlistedByRecruiterId(
            @Param("recruiterId") Long recruiterId
    );

    
    List<application> findByStatus(String status);
}