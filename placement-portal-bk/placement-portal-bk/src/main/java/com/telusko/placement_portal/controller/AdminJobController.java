package com.telusko.placement_portal.controller;

import com.telusko.placement_portal.dto.*;
import com.telusko.placement_portal.service.AdminJobService;
import com.telusko.placement_portal.service.AdminAuditService;
import com.telusko.placement_portal.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/jobs")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminJobController {
    private final AdminJobService jobs;
    private final AdminAuditService audit;

    public AdminJobController(AdminJobService jobs, AdminAuditService audit) { this.jobs = jobs; this.audit=audit; }

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
    @Transactional public Map<String, Object> approve(@PathVariable Long id,@AuthenticationPrincipal UserPrincipal admin) {
        String status=jobs.approve(id); audit.record(admin,"JOB_APPROVED","JOB",id,"Job approved",null,"approvalStatus="+status);
        return Map.of("id", id, "approvalStatus", status, "message", "Job approved.");
    }

    @PatchMapping("/{id}/reject")
    @Transactional public Map<String, Object> reject(@PathVariable Long id, @Valid @RequestBody AdminJobRejectionRequest request,@AuthenticationPrincipal UserPrincipal admin) {
        String status=jobs.reject(id, request.reason()); audit.record(admin,"JOB_REJECTED","JOB",id,"Job rejected",request.reason(),"approvalStatus="+status);
        return Map.of("id", id, "approvalStatus", status, "message", "Job rejected. The reason is saved for recruiter review.");
    }

    @PatchMapping("/{id}/review")
    @Transactional public Map<String, Object> returnToReview(@PathVariable Long id,@AuthenticationPrincipal UserPrincipal admin) {
        String status=jobs.returnToReview(id);audit.record(admin,"JOB_RETURNED_TO_REVIEW","JOB",id,"Job returned to review",null,"approvalStatus="+status);
        return Map.of("id", id, "approvalStatus", status, "message", "Job returned to pending review.");
    }

    @PatchMapping("/{id}/close")
    @Transactional public Map<String, Object> close(@PathVariable Long id,@AuthenticationPrincipal UserPrincipal admin) {
        jobs.close(id);
        audit.record(admin,"JOB_CLOSED","JOB",id,"Job closed",null,"closed=true");
        return Map.of("id", id, "message", "Job closed. Existing applications were preserved.");
    }

    @PatchMapping("/{id}/reopen")
    @Transactional public Map<String, Object> reopen(@PathVariable Long id,@AuthenticationPrincipal UserPrincipal admin) {
        jobs.reopen(id);
        audit.record(admin,"JOB_REOPENED","JOB",id,"Job reopened",null,"closed=false");
        return Map.of("id", id, "message", "Job reopened and can accept applications if the deadline remains valid.");
    }

    @PatchMapping("/{id}/flag")
    @Transactional public Map<String, Object> flag(@PathVariable Long id, @Valid @RequestBody AdminJobFlagRequest request,@AuthenticationPrincipal UserPrincipal admin) {
        jobs.flag(id, request.reason());
        audit.record(admin,"JOB_FLAGGED","JOB",id,"Job flagged for review",request.reason(),"moderationFlagged=true");
        return Map.of("id", id, "moderationFlagged", true, "message", "Job flagged for Admin investigation.");
    }

    @PatchMapping("/{id}/unflag")
    @Transactional public Map<String, Object> unflag(@PathVariable Long id,@AuthenticationPrincipal UserPrincipal admin) {
        jobs.unflag(id);
        audit.record(admin,"JOB_UNFLAGGED","JOB",id,"Job moderation flag removed",null,"moderationFlagged=false");
        return Map.of("id", id, "moderationFlagged", false, "message", "Moderation flag removed.");
    }
}

