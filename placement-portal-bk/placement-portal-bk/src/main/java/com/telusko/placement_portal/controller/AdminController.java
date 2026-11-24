package com.telusko.placement_portal.controller;

import com.telusko.placement_portal.repository.ApplicationRepo;
import com.telusko.placement_portal.repository.JobRepo;
import com.telusko.placement_portal.repository.UserRepository;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {
    private final UserRepository users;
    private final JobRepo jobs;
    private final ApplicationRepo applications;

    public AdminController(UserRepository users, JobRepo jobs, ApplicationRepo applications) {
        this.users = users;
        this.jobs = jobs;
        this.applications = applications;
    }

    @GetMapping("/overview")
    public Map<String, Long> overview() {
        return Map.of(
                "students", users.countByRole("STUDENT"),
                "recruiters", users.countByRole("RECRUITER"),
                "jobs", jobs.count(),
                "applications", applications.count()
        );
    }
}
