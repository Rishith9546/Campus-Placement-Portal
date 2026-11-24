package com.telusko.placement_portal.controller;

import com.telusko.placement_portal.dto.*;
import com.telusko.placement_portal.service.AdminJobService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/jobs")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminJobController {
    private final AdminJobService jobs;

    public AdminJobController(AdminJobService jobs) { this.jobs = jobs; }

    @GetMapping
    public AdminJobPageDto list(@RequestParam(defaultValue = "0") int page,
                                @RequestParam(defaultValue = "10") int size,
                                @RequestParam(required = false) String search,
                                @RequestParam(required = false) String approvalStatus,
                                @RequestParam(required = false) String jobStatus,
                                @RequestParam(required = false) String jobType,
                                @RequestParam(required = false) String location,
                                @RequestParam(required = false) String company,
                                @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate postedFrom,
                                @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate postedTo,
                                @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate deadlineFrom,
                                @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate deadlineTo,
                                @RequestParam(defaultValue = "createdAt") String sortBy,
                                @RequestParam(defaultValue = "desc") String sortDirection) {
        return jobs.list(page, size, search, approvalStatus, jobStatus, jobType, location, company,
                postedFrom, postedTo, deadlineFrom, deadlineTo, sortBy, sortDirection);
    }

    @GetMapping("/statistics")
    public AdminJobStatisticsDto statistics() { return jobs.statistics(); }

    @GetMapping("/{id}")
    public AdminJobDetailsDto details(@PathVariable Long id) { return jobs.details(id); }

    @PatchMapping("/{id}/approve")
    public Map<String, Object> approve(@PathVariable Long id) {
        return Map.of("id", id, "approvalStatus", jobs.approve(id), "message", "Job approved.");
    }

    @PatchMapping("/{id}/reject")
    public Map<String, Object> reject(@PathVariable Long id, @Valid @RequestBody AdminJobRejectionRequest request) {
        return Map.of("id", id, "approvalStatus", jobs.reject(id, request.reason()), "message", "Job rejected. The reason is saved for recruiter review.");
    }

    @PatchMapping("/{id}/review")
    public Map<String, Object> returnToReview(@PathVariable Long id) {
        return Map.of("id", id, "approvalStatus", jobs.returnToReview(id), "message", "Job returned to pending review.");
    }

    @PatchMapping("/{id}/close")
    public Map<String, Object> close(@PathVariable Long id) {
        jobs.close(id);
        return Map.of("id", id, "message", "Job closed. Existing applications were preserved.");
    }

    @PatchMapping("/{id}/reopen")
    public Map<String, Object> reopen(@PathVariable Long id) {
        jobs.reopen(id);
        return Map.of("id", id, "message", "Job reopened and can accept applications if the deadline remains valid.");
    }

    @PatchMapping("/{id}/flag")
    public Map<String, Object> flag(@PathVariable Long id, @Valid @RequestBody AdminJobFlagRequest request) {
        jobs.flag(id, request.reason());
        return Map.of("id", id, "moderationFlagged", true, "message", "Job flagged for Admin investigation.");
    }

    @PatchMapping("/{id}/unflag")
    public Map<String, Object> unflag(@PathVariable Long id) {
        jobs.unflag(id);
        return Map.of("id", id, "moderationFlagged", false, "message", "Moderation flag removed.");
    }
}
