package com.telusko.placement_portal.controller;

import com.telusko.placement_portal.dto.*;
import com.telusko.placement_portal.security.UserPrincipal;
import com.telusko.placement_portal.service.AdminRecruiterService;
import com.telusko.placement_portal.service.AdminAuditService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/recruiters")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminRecruiterController {
    private final AdminRecruiterService recruiters;
    private final AdminAuditService audit;

    public AdminRecruiterController(AdminRecruiterService recruiters, AdminAuditService audit) { this.recruiters = recruiters; this.audit=audit; }

    @GetMapping
    public AdminRecruiterPageDto list(@RequestParam(defaultValue = "0") int page,
                                      @RequestParam(defaultValue = "10") int size,
                                      @RequestParam(required = false) String search,
                                      @RequestParam(required = false) String verificationStatus,
                                      @RequestParam(required = false) String accountStatus,
                                      @RequestParam(required = false) String company,
                                      @RequestParam(defaultValue = "name") String sortBy,
                                      @RequestParam(defaultValue = "asc") String sortDirection) {
        return recruiters.list(page, size, search, verificationStatus, accountStatus, company, sortBy, sortDirection);
    }

    @GetMapping("/companies")
    public List<String> companies() { return recruiters.companies(); }

    @GetMapping("/{id}")
    public AdminRecruiterDetailsDto details(@PathVariable Long id) { return recruiters.details(id); }

    @GetMapping("/{id}/jobs")
    public AdminRecruiterJobsDto jobs(@PathVariable Long id) { return recruiters.jobs(id); }

    @PatchMapping("/{id}/verification")
    @Transactional public Map<String, Object> verification(@PathVariable Long id, @Valid @RequestBody AdminRecruiterVerificationRequest request, @AuthenticationPrincipal UserPrincipal admin) {
        String status = recruiters.updateVerification(id, request.status());
        audit.record(admin,"RECRUITER_"+status,"RECRUITER",id,"Recruiter review status changed",null,"verificationStatus="+status);
        return Map.of("id", id, "verificationStatus", status, "message", "Recruiter portal review status updated to " + status + ".");
    }

    @PatchMapping("/{id}/status")
    @Transactional public Map<String, Object> status(@PathVariable Long id, @Valid @RequestBody AdminRecruiterStatusRequest request,
                                      @AuthenticationPrincipal UserPrincipal admin) {
        boolean enabled = recruiters.updateAccountStatus(id, request.enabled(), admin);
        audit.record(admin,enabled?"RECRUITER_ACTIVATED":"RECRUITER_DEACTIVATED","RECRUITER",id,"Recruiter account status changed",null,"enabled="+enabled);
        return Map.of("id", id, "enabled", enabled, "message", enabled ? "Recruiter account activated." : "Recruiter account deactivated.");
    }
}

