package com.telusko.placement_portal.controller;

import com.telusko.placement_portal.entity.application;
import com.telusko.placement_portal.security.UserPrincipal;
import com.telusko.placement_portal.service.ApplicationService;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
@CrossOrigin(origins = "http://localhost:5173")
public class ApplicationController {

    private final ApplicationService service;

    public ApplicationController(ApplicationService service) {
        this.service = service;
    }

    // ================= APPLY FOR JOB =================

    @PostMapping("/applied")
    public application addApplication(
            @RequestBody application application) {

        return service.save(application);
    }

    // ================= GET ALL APPLICATIONS BY STUDENT =================

    @GetMapping("/student/{studentId}")
    public List<application> getByStudentId(
            @PathVariable Long studentId) {

        return service.getByStudentId(studentId);
    }

    @GetMapping("/recruiter/applicants")
    public List<application> getRecruiterApplicants(
            @AuthenticationPrincipal UserPrincipal user) {

        System.out.println("Recruiter ID: " + user.getId());

        return service.getByRecruiterId(user.getId());
    }
    // ================= GET APPLICATION BY STUDENT + JOB =================

    @GetMapping("/student/{studentId}/job/{jobId}")
    public application getApplication(
            @PathVariable Long studentId,
            @PathVariable Long jobId) {

        return service.getApplication(studentId, jobId);
    }

    // ================= GET STATUS =================

    @GetMapping("/getStatus/{id}")
    public String getStatus(@PathVariable Long id) {

        return service.getStatus(id);
    }


    @PutMapping("/shortlist/{id}")
    public application shortlistApplication(@PathVariable Long id) {

        return service.shortlistApplication(id);
    }
    @PutMapping("/rejected/{id}")
    public application rejectedApplication(@PathVariable Long id) {
        return service.rejectApplication(id);
    }
    @GetMapping("/count")
    public long getApplicationCount(
            @AuthenticationPrincipal UserPrincipal user) {

        return service.getApplicationCount(user.getId());
    }

    @GetMapping("/shortlisted/count")
    public long getShortlistedApplicationCount(
            @AuthenticationPrincipal UserPrincipal user) {
        return service.getShortlistedCount(user.getId());
    }

    @GetMapping("/recuriter/shortlisted")
    public List<application> getShortlistedApplications(
            @AuthenticationPrincipal UserPrincipal user
    ){
        return service.getShortlisted(user.getId());
    }

    @GetMapping("/recruiter/shortlisted/search")
    public List<application> searchShortlisted(
            @RequestParam String keyword) {

        return service.searchShortlisted(keyword);
    }

    @GetMapping("/countById/{id}")
    public long getJobsCountById( @PathVariable int id) {
        return service.getJobsCountById(id);
    }



}