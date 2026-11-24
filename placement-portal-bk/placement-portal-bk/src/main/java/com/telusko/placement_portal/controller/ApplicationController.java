package com.telusko.placement_portal.controller;

import com.telusko.placement_portal.entity.application;
import com.telusko.placement_portal.security.UserPrincipal;
import com.telusko.placement_portal.service.ApplicationService;
import com.telusko.placement_portal.service.JobMatchService;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/applications")
@CrossOrigin(origins = "http://localhost:5173")
public class ApplicationController {

    private final ApplicationService service;
    private final JobMatchService jobMatchService;

    public ApplicationController(ApplicationService service, JobMatchService jobMatchService) {
        this.service = service;
        this.jobMatchService = jobMatchService;
    }

    // ================= APPLY FOR JOB =================

    @PostMapping("/applied")
    public application addApplication(
            @RequestBody application application,
            @AuthenticationPrincipal UserPrincipal user) {
        ensureOwnStudent(user, application.getStudentId());
        var match = jobMatchService.details(user, application.getJobId());
        if (!match.active()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This job is closed and no longer accepting applications.");
        }
        if ("NOT_ELIGIBLE".equals(match.eligibilityStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    String.join(" ", match.eligibilityReasons()));
        }
        return service.save(application);
    }

    // ================= GET ALL APPLICATIONS BY STUDENT =================

    @GetMapping("/student/{studentId}")
    public List<application> getByStudentId(
            @PathVariable Long studentId,
            @AuthenticationPrincipal UserPrincipal user) {
        ensureOwnStudent(user, studentId);
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
    public Optional<application> getApplication(
            @PathVariable Long studentId,
            @PathVariable Long jobId,
            @AuthenticationPrincipal UserPrincipal user
            ) {
        ensureOwnStudent(user, studentId);
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
            @RequestParam Long jobId,
            @RequestParam String keyword) {

        System.out.println("JOB ID = " + jobId);
        System.out.println("KEYWORD = " + keyword);

        return service.searchShortlisted(jobId, keyword);
    }

    @GetMapping("/countById/{id}")
    public long getJobsCountById( @PathVariable int id) {
        return service.getJobsCountById(id);
    }

    private void ensureOwnStudent(UserPrincipal user, Long studentId) {
        if (user == null || studentId == null || !studentId.equals(user.getId())
                || user.getAuthorities().stream().noneMatch(a -> "ROLE_STUDENT".equals(a.getAuthority()))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can access only your own student applications");
        }
    }




}
