package com.telusko.placement_portal.repository;

import com.telusko.placement_portal.entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JobRepo extends JpaRepository<Job, Long> {
    List<Job> findTop3ByRecruiterIdOrderByCreatedAtDesc(Long recruiterId);
    List<Job> findByRecruiterId(Long recruiterId);
    long countByRecruiterId(Long recruiterId);

}
