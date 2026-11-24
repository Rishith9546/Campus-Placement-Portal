package com.telusko.placement_portal.service;

import com.telusko.placement_portal.dto.*;
import com.telusko.placement_portal.entity.Job;
import com.telusko.placement_portal.entity.User;
import com.telusko.placement_portal.repository.ApplicationRepo;
import com.telusko.placement_portal.repository.JobRepo;
import com.telusko.placement_portal.repository.UserRepository;
import com.telusko.placement_portal.security.UserPrincipal;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminRecruiterService {
    private static final Set<String> VERIFICATION_STATUSES = Set.of("PENDING", "VERIFIED", "REJECTED");
    private static final Set<String> SORT_FIELDS = Set.of("name", "email", "companyName", "enabled", "verificationStatus");
    private final UserRepository users;
    private final JobRepo jobs;
    private final ApplicationRepo applications;

    public AdminRecruiterService(UserRepository users, JobRepo jobs, ApplicationRepo applications) {
        this.users = users;
        this.jobs = jobs;
        this.applications = applications;
    }

    @Transactional(readOnly = true)
    public AdminRecruiterPageDto list(int page, int size, String search, String verificationStatus,
                                      String accountStatus, String company, String sortBy, String sortDirection) {
        if (page < 0 || size < 1 || size > 100) throw badRequest("Page must be non-negative and size must be between 1 and 100.");
        String verification = blankToNull(verificationStatus);
        if (verification != null) {
            verification = verification.toUpperCase(Locale.ROOT);
            if (!VERIFICATION_STATUSES.contains(verification)) throw badRequest("Verification status must be PENDING, VERIFIED, or REJECTED.");
        }
        Boolean enabled = switch (accountStatus == null ? "" : accountStatus.trim().toUpperCase(Locale.ROOT)) {
            case "ACTIVE", "ENABLED" -> true;
            case "INACTIVE", "DISABLED" -> false;
            case "", "ALL" -> null;
            default -> throw badRequest("Account status must be ACTIVE, INACTIVE, or ALL.");
        };
        String safeSort = sortBy == null || sortBy.isBlank() ? "name" : sortBy.trim();
        if (!SORT_FIELDS.contains(safeSort)) throw badRequest("Unsupported sort field.");
        Sort.Direction direction;
        try { direction = Sort.Direction.fromString(sortDirection == null ? "asc" : sortDirection); }
        catch (IllegalArgumentException ex) { throw badRequest("Sort direction must be asc or desc."); }

        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, safeSort).and(Sort.by(Sort.Direction.ASC, "id")));
        Page<AdminRecruiterProjection> found = users.searchAdminRecruiters(blankToNull(search), blankToNull(company), verification, enabled, pageable);
        List<Long> ids = found.getContent().stream().map(AdminRecruiterProjection::getId).toList();
        Map<Long, Long> jobCounts = ids.isEmpty() ? Map.of() : jobs.countByRecruiterIds(ids).stream()
                .collect(Collectors.toMap(RecruiterJobCountProjection::getRecruiterId, RecruiterJobCountProjection::getJobCount));
        List<AdminRecruiterListItem> content = found.getContent().stream().map(recruiter -> new AdminRecruiterListItem(
                recruiter.getId(), recruiter.getName(), recruiter.getEmail(), recruiter.getCompanyName(),
                Boolean.TRUE.equals(recruiter.getEnabled()), normalizeVerification(recruiter.getVerificationStatus()),
                jobCounts.getOrDefault(recruiter.getId(), 0L))).toList();
        return new AdminRecruiterPageDto(content, found.getNumber(), found.getSize(), found.getTotalElements(), found.getTotalPages(), stats());
    }

    @Transactional(readOnly = true)
    public AdminRecruiterStatsDto stats() {
        return new AdminRecruiterStatsDto(users.countByRole("RECRUITER"),
                users.countByRoleAndVerificationStatusIgnoreCase("RECRUITER", "VERIFIED"),
                users.countByRoleAndVerificationStatusIgnoreCase("RECRUITER", "PENDING"),
                users.countByRoleAndVerificationStatusIgnoreCase("RECRUITER", "REJECTED"),
                users.countByRoleAndEnabled("RECRUITER", true), users.countByRoleAndEnabled("RECRUITER", false));
    }

    @Transactional(readOnly = true)
    public List<String> companies() { return users.findDistinctRecruiterCompanies(); }

    @Transactional(readOnly = true)
    public AdminRecruiterDetailsDto details(Long id) {
        User recruiter = requireRecruiter(id);
        long totalJobs = jobs.countByRecruiterId(id);
        long closedJobs = jobs.countByRecruiterIdAndDeadlineLessThan(id, LocalDate.now());
        long activeJobs = jobs.countByRecruiterIdAndDeadlineGreaterThanEqual(id, LocalDate.now())
                + jobs.countByRecruiterIdAndDeadlineIsNull(id);
        long totalApplications = applications.countApplicationsByRecruiterId(id);
        return new AdminRecruiterDetailsDto(recruiter.getId(), recruiter.getName(), recruiter.getEmail(),
                recruiter.getCompanyName(), recruiter.isEnabled(), normalizeVerification(recruiter.getVerificationStatus()),
                null, null, null, null, null, null, null, null,
                totalJobs, activeJobs, closedJobs, totalApplications);
    }

    @Transactional(readOnly = true)
    public AdminRecruiterJobsDto jobs(Long recruiterId) {
        requireRecruiter(recruiterId);
        LocalDate today = LocalDate.now();
        long totalJobs = jobs.countByRecruiterId(recruiterId);
        long closedJobs = jobs.countByRecruiterIdAndDeadlineLessThan(recruiterId, today);
        long activeJobs = jobs.countByRecruiterIdAndDeadlineGreaterThanEqual(recruiterId, today)
                + jobs.countByRecruiterIdAndDeadlineIsNull(recruiterId);
        List<Job> recent = jobs.findTop10ByRecruiterIdOrderByCreatedAtDesc(recruiterId);
        List<Long> jobIds = recent.stream().map(Job::getId).toList();
        Map<Long, Long> counts = jobIds.isEmpty() ? Map.of() : applications.countByJobIds(jobIds).stream()
                .collect(Collectors.toMap(JobApplicationCountProjection::getJobId, JobApplicationCountProjection::getApplicationCount));
        List<AdminRecruiterJobDto> jobDtos = recent.stream().map(job -> new AdminRecruiterJobDto(
                job.getId(), job.getTitle(), job.getCompany(), job.getJobType(), job.getCreatedAt(), job.getDeadline(),
                job.getDeadline() == null || !job.getDeadline().isBefore(today) ? "ACTIVE" : "CLOSED",
                counts.getOrDefault(job.getId(), 0L))).toList();
        return new AdminRecruiterJobsDto(totalJobs, activeJobs, closedJobs,
                applications.countApplicationsByRecruiterId(recruiterId), jobDtos);
    }

    @Transactional
    public String updateVerification(Long id, String value) {
        User recruiter = requireRecruiter(id);
        String status = value == null ? "" : value.trim().toUpperCase(Locale.ROOT);
        if (!VERIFICATION_STATUSES.contains(status)) throw badRequest("Verification status must be PENDING, VERIFIED, or REJECTED.");
        if ("VERIFIED".equals(status) && (recruiter.getCompanyName() == null || recruiter.getCompanyName().isBlank())) {
            throw badRequest("A company name is required before marking this recruiter profile as reviewed and verified.");
        }
        recruiter.setVerificationStatus(status);
        users.save(recruiter);
        return status;
    }

    @Transactional
    public boolean updateAccountStatus(Long id, boolean enabled, UserPrincipal admin) {
        if (admin != null && Objects.equals(admin.getId(), id)) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot change your own account from recruiter management.");
        User recruiter = requireRecruiter(id);
        recruiter.setEnabled(enabled);
        users.save(recruiter);
        return recruiter.isEnabled();
    }

    private User requireRecruiter(Long id) {
        User user = users.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Recruiter not found."));
        if (!"RECRUITER".equalsIgnoreCase(user.getRole())) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Recruiter not found.");
        return user;
    }

    private String normalizeVerification(String status) {
        if (status == null || status.isBlank()) return "PENDING";
        String normalized = status.toUpperCase(Locale.ROOT);
        return VERIFICATION_STATUSES.contains(normalized) ? normalized : "PENDING";
    }

    private String blankToNull(String value) { return value == null || value.isBlank() ? null : value.trim(); }
    private ResponseStatusException badRequest(String message) { return new ResponseStatusException(HttpStatus.BAD_REQUEST, message); }
}
