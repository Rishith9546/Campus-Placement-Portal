package com.telusko.placement_portal.service;

import com.telusko.placement_portal.entity.Job;
import com.telusko.placement_portal.repository.JobRepo;
import com.telusko.placement_portal.repository.StudentRepo;
import com.telusko.placement_portal.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class JobService {
    @Autowired
    private final JobRepo jobRepo;

    public JobService(JobRepo jobRepo) {

        this.jobRepo = jobRepo;
    }


    public Job PostJob(Job job, UserPrincipal user) {
        Long recruiterId=user.getId();
        job.setRecruiterId(recruiterId);
        job.setCreatedAt(LocalDateTime.now());
        return jobRepo.save(job);
    }

    public List<Job> getFinalJobs() {
        return jobRepo.findAll();
    }

    public List<Job> getRecentJobs(Long recruiterId) {
        return jobRepo.findTop3ByRecruiterIdOrderByCreatedAtDesc(recruiterId);
    }

    public List<Job> getAllJobs() {
        return jobRepo.findAll();
    }

    public Job geyJobById(Long id) {
        return jobRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));
    }

    public long getJobCount(Long id) {
       return jobRepo.countByRecruiterId(id);
    }
}
