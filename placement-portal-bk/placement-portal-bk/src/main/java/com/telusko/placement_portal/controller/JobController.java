package com.telusko.placement_portal.controller;

import com.telusko.placement_portal.entity.Job;
import com.telusko.placement_portal.repository.UserRepository;
import com.telusko.placement_portal.security.UserPrincipal;
import com.telusko.placement_portal.service.JobService;
import com.telusko.placement_portal.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import tools.jackson.databind.ser.SerializationContextExt;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
public class JobController {
    private final JobService jobService;
    public JobController(JobService jobService) {
        this.jobService = jobService;
    }
    @PostMapping("/addJob")
    public Job PostJob(@RequestBody  Job job , @AuthenticationPrincipal UserPrincipal user) {
        if (user == null) {
            throw new RuntimeException("User not authenticated");
        }

        return  jobService.PostJob(job,user);

    }
    @GetMapping("/getJobs")
    public List<Job> getJobs() {
        return jobService.getFinalJobs();
    }
    @GetMapping("/recent")
    public List<Job> getRecentJobs(
            @AuthenticationPrincipal UserPrincipal user) {

        if (user == null) {
            throw new RuntimeException("User not authenticated");
        }

        return jobService.getRecentJobs(user.getId());
    }
    @GetMapping("/allJobs")
    public List<Job> getAllJobs() {
        return jobService.getAllJobs();
    }

    @GetMapping("/{id}")
    public Job getJobById(@PathVariable Long id) {
       return jobService.geyJobById(id);
    }
    @GetMapping("/count")
    public long getJobsCount(@AuthenticationPrincipal UserPrincipal user) {
     return  jobService.getJobCount(user.getId());
    }
    @GetMapping("allJobsById")
    public List<Job> getJobByRecruiterId(@AuthenticationPrincipal UserPrincipal user) {
        return jobService.getJobByRecruiterId(user.getId());
    }

}
