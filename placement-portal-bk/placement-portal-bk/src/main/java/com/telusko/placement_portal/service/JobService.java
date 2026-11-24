package com.telusko.placement_portal.service;

import com.telusko.placement_portal.entity.Job;
import com.telusko.placement_portal.repository.JobRepo;
import com.telusko.placement_portal.repository.StudentRepo;
import com.telusko.placement_portal.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
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
        // A recruiter submission always creates a new record; client-supplied IDs cannot overwrite jobs.
        job.setId(null);
        Long recruiterId=user.getId();
        job.setRecruiterId(recruiterId);
        job.setCreatedAt(LocalDateTime.now());
        job.setApprovalStatus("PENDING");
        job.setRejectionReason(null);
        job.setClosed(false);
        job.setModerationFlagged(false);
        job.setModerationReason(null);
        return jobRepo.save(job);
    }

    public List<Job> getFinalJobs() {
        return jobRepo.findStudentVisibleJobs(LocalDate.now());
    }

    public List<Job> getRecentJobs(Long recruiterId) {
        return jobRepo.findTop3ByRecruiterIdOrderByCreatedAtDesc(recruiterId);
    }

    public List<Job> getAllJobs() {
        return jobRepo.findStudentVisibleJobs(LocalDate.now());
    }

    public Job geyJobById(Long id) {
        return jobRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));
    }

    public Job getRecruiterJobById(Long id, Long recruiterId) {
        return jobRepo.findByIdAndRecruiterId(id, recruiterId)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "Job not found."));
    }

    public Job getStudentVisibleJob(Long id) {
        return jobRepo.findStudentVisibleJob(id, LocalDate.now())
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "Job not found."));
    }

    public long getJobCount(Long id) {
       return jobRepo.countByRecruiterId(id);
    }

    public List<Job> getJobByRecruiterId(Long id) {
        return jobRepo.findByRecruiterId(id);
    }


    public List<Job> getJobByActiveId(Long id) {
        return jobRepo.findByRecruiterIdAndDeadlineGreaterThanEqual(
                id,
                LocalDate.now()
        );
    }

    public List<Job> getJobByClosedId(Long id) {
        return jobRepo.findByRecruiterIdAndDeadlineLessThan(
                id,
                LocalDate.now()
        );
    }

    public List<Job> searchJobs(String keyword,Long id) {
        return jobRepo.searchJobsById(keyword,id);
    }

    public Job updateJob(Long id, Job updatedJob, Long recruiterId) {

        Job existingJob = jobRepo.findByIdAndRecruiterId(id, recruiterId)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "Job not found."));

        existingJob.setTitle(updatedJob.getTitle());
        existingJob.setLocation(updatedJob.getLocation());
        existingJob.setJobType(updatedJob.getJobType());
        existingJob.setSalary(updatedJob.getSalary());
        existingJob.setDeadline(updatedJob.getDeadline());
        existingJob.setSkills(updatedJob.getSkills());
        existingJob.setEligibility(updatedJob.getEligibility());
        existingJob.setDescription(updatedJob.getDescription());
        existingJob.setResponsibilities(updatedJob.getResponsibilities());
        // A materially edited posting returns for Admin review.
        existingJob.setApprovalStatus("PENDING");
        existingJob.setRejectionReason(null);
        return jobRepo.save(existingJob);
    }

    public List<Job> searchJobsForStudent(String keyword) {
        return jobRepo.searchStudentVisibleJobs(keyword == null ? "" : keyword.trim(), LocalDate.now());
    }
}
