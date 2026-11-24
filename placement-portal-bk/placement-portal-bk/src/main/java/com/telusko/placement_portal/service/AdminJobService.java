package com.telusko.placement_portal.service;

import com.telusko.placement_portal.dto.*;
import com.telusko.placement_portal.entity.Job;
import com.telusko.placement_portal.entity.User;
import com.telusko.placement_portal.entity.PipelineStage;
import com.telusko.placement_portal.repository.ApplicationRepo;
import com.telusko.placement_portal.repository.JobRepo;
import com.telusko.placement_portal.repository.UserRepository;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminJobService {
    private static final Set<String> APPROVAL_STATUSES = Set.of("PENDING", "APPROVED", "REJECTED");
    private static final Set<String> JOB_STATUSES = Set.of("ACTIVE", "CLOSED", "EXPIRED", "PENDING", "APPROVED", "REJECTED", "FLAGGED");
    private static final Set<String> SORT_FIELDS = Set.of("title", "company", "location", "jobType", "salary", "createdAt", "deadline", "approvalStatus");
    private final JobRepo jobs;
    private final UserRepository users;
    private final ApplicationRepo applications;

    public AdminJobService(JobRepo jobs, UserRepository users, ApplicationRepo applications) {
        this.jobs = jobs;
        this.users = users;
        this.applications = applications;
    }

    @Transactional(readOnly = true)
    public AdminJobPageDto list(int page, int size, String search, String approvalStatus, String jobStatus,
                                String jobType, String location, String company, LocalDate postedFrom,
                                LocalDate postedTo, LocalDate deadlineFrom, LocalDate deadlineTo,
                                String sortBy, String sortDirection) {
        if (page < 0 || size < 1 || size > 100) throw badRequest("Page must be non-negative and size must be between 1 and 100.");
        String approval = normalizeFilter(approvalStatus, APPROVAL_STATUSES, "Approval status must be PENDING, APPROVED, or REJECTED.");
        String state = normalizeFilter(jobStatus, JOB_STATUSES, "Unsupported job status filter.");
        String sortField = sortBy == null || sortBy.isBlank() ? "createdAt" : sortBy.trim();
        if (!SORT_FIELDS.contains(sortField)) throw badRequest("Unsupported sort field.");
        if (postedFrom != null && postedTo != null && postedFrom.isAfter(postedTo)) throw badRequest("Posted-from date cannot be after posted-to date.");
        if (deadlineFrom != null && deadlineTo != null && deadlineFrom.isAfter(deadlineTo)) throw badRequest("Deadline-from date cannot be after deadline-to date.");
        Sort.Direction direction;
        try { direction = Sort.Direction.fromString(sortDirection == null ? "desc" : sortDirection); }
        catch (IllegalArgumentException ex) { throw badRequest("Sort direction must be asc or desc."); }
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortField).and(Sort.by(Sort.Direction.DESC, "id")));
        Page<AdminJobProjection> found = jobs.searchAdminJobs(blankToNull(search), approval, state,
                blankToNull(jobType), blankToNull(location), blankToNull(company),
                postedFrom == null ? null : postedFrom.atStartOfDay(),
                postedTo == null ? null : postedTo.atTime(23, 59, 59, 999_999_999),
                deadlineFrom, deadlineTo, LocalDate.now(), pageable);
        List<Long> jobIds = found.getContent().stream().map(AdminJobProjection::getId).toList();
        Map<Long, Long> appCounts = jobIds.isEmpty() ? Map.of() : applications.countByJobIds(jobIds).stream()
                .collect(Collectors.toMap(JobApplicationCountProjection::getJobId, JobApplicationCountProjection::getApplicationCount));
        List<AdminJobListItem> content = found.getContent().stream().map(row -> new AdminJobListItem(
                row.getId(), row.getTitle(), row.getCompany(), row.getLocation(), row.getJobType(), row.getSalary(),
                row.getCreatedAt(), row.getDeadline(), normalizeApproval(row.getApprovalStatus()),
                jobStatus(row.getApprovalStatus(), Boolean.TRUE.equals(row.getClosed()), Boolean.TRUE.equals(row.getModerationFlagged()), row.getDeadline()),
                Boolean.TRUE.equals(row.getModerationFlagged()), row.getRecruiterId(), row.getRecruiterName(),
                row.getRecruiterEmail(), appCounts.getOrDefault(row.getId(), 0L))).toList();
        return new AdminJobPageDto(content, found.getNumber(), found.getSize(), found.getTotalElements(), found.getTotalPages(),
                statistics(), jobs.findDistinctCompanies(), jobs.findDistinctJobTypes());
    }

    @Transactional(readOnly = true)
    public AdminJobStatisticsDto statistics() {
        LocalDate today = LocalDate.now();
        return new AdminJobStatisticsDto(jobs.count(), jobs.countByApprovalStatusIgnoreCase("PENDING"),
                jobs.countByApprovalStatusIgnoreCase("APPROVED"), jobs.countByApprovalStatusIgnoreCase("REJECTED"),
                jobs.countStudentVisibleJobs(today), jobs.countByClosedTrue(), jobs.countExpiredJobs(today),
                jobs.countByModerationFlaggedTrue());
    }

    @Transactional(readOnly = true)
    public AdminJobDetailsDto details(Long id) {
        Job job = requireJob(id);
        User recruiter = job.getRecruiterId() == null ? null : users.findById(job.getRecruiterId()).orElse(null);
        Map<String, Long> counts = new LinkedHashMap<>();
        for (Object[] row : applications.countStatusesByJobId(id)) counts.put(String.valueOf(row[0]), ((Number) row[1]).longValue());
        for (PipelineStage stage : PipelineStage.values()) counts.putIfAbsent(stage.name(), 0L);
        long total = counts.values().stream().mapToLong(Long::longValue).sum();
        return new AdminJobDetailsDto(job.getId(), job.getTitle(), job.getCompany(), job.getLocation(), job.getJobType(),
                job.getSalary(), job.getDescription(), job.getResponsibilities(), job.getEligibility(), job.getSkills(),
                job.getDeadline(), job.getCreatedAt(), job.getRecruiterId(), recruiter == null ? null : recruiter.getName(),
                recruiter == null ? null : recruiter.getEmail(), recruiter == null ? null : recruiter.getVerificationStatus(),
                normalizeApproval(job.getApprovalStatus()), job.getRejectionReason(),
                jobStatus(job.getApprovalStatus(), job.isClosed(), job.isModerationFlagged(), job.getDeadline()),
                job.isClosed(), job.isModerationFlagged(), job.getModerationReason(), total, counts);
    }

    @Transactional
    public String approve(Long id) {
        Job job = requireJob(id);
        if (!"PENDING".equalsIgnoreCase(normalizeApproval(job.getApprovalStatus()))) throw conflict("Only jobs pending review can be approved. Return a rejected job to review first.");
        job.setApprovalStatus("APPROVED");
        job.setRejectionReason(null);
        jobs.save(job);
        return "APPROVED";
    }

    @Transactional
    public String reject(Long id, String reason) {
        String normalizedReason = requiredReason(reason, "A rejection reason is required.");
        Job job = requireJob(id);
        if ("REJECTED".equalsIgnoreCase(job.getApprovalStatus())) throw conflict("This job is already rejected.");
        job.setApprovalStatus("REJECTED");
        job.setRejectionReason(normalizedReason);
        jobs.save(job);
        return "REJECTED";
    }

    @Transactional
    public String returnToReview(Long id) {
        Job job = requireJob(id);
        if (!"REJECTED".equalsIgnoreCase(job.getApprovalStatus())) throw conflict("Only rejected jobs can be returned to review.");
        job.setApprovalStatus("PENDING");
        jobs.save(job);
        return "PENDING";
    }

    @Transactional
    public void close(Long id) {
        Job job = requireJob(id);
        if (!"APPROVED".equalsIgnoreCase(job.getApprovalStatus())) throw conflict("Only approved jobs can be closed.");
        if (job.isClosed()) throw conflict("This job is already closed.");
        job.setClosed(true);
        jobs.save(job);
    }

    @Transactional
    public void reopen(Long id) {
        Job job = requireJob(id);
        if (!job.isClosed()) throw conflict("This job is not manually closed.");
        if (!"APPROVED".equalsIgnoreCase(job.getApprovalStatus())) throw conflict("Only approved jobs can be reopened.");
        if (job.isModerationFlagged()) throw conflict("Remove the moderation flag before reopening this job.");
        if (job.getDeadline() != null && job.getDeadline().isBefore(LocalDate.now())) throw conflict("This job's deadline has passed. Extend the deadline before reopening it.");
        job.setClosed(false);
        jobs.save(job);
    }

    @Transactional
    public void flag(Long id, String reason) {
        Job job = requireJob(id);
        job.setModerationFlagged(true);
        job.setModerationReason(requiredReason(reason, "A moderation reason is required."));
        jobs.save(job);
    }

    @Transactional
    public void unflag(Long id) {
        Job job = requireJob(id);
        if (!job.isModerationFlagged()) throw conflict("This job is not flagged for moderation.");
        job.setModerationFlagged(false);
        job.setModerationReason(null);
        jobs.save(job);
    }

    private Job requireJob(Long id) {
        return jobs.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Job not found."));
    }

    private String jobStatus(String approval, boolean closed, boolean flagged, LocalDate deadline) {
        if (closed) return "CLOSED";
        if (deadline != null && deadline.isBefore(LocalDate.now())) return "EXPIRED";
        if (flagged) return "FLAGGED";
        return switch (normalizeApproval(approval)) {
            case "PENDING" -> "PENDING";
            case "REJECTED" -> "REJECTED";
            default -> "ACTIVE";
        };
    }

    private String normalizeApproval(String status) { return status == null || status.isBlank() ? "APPROVED" : status.trim().toUpperCase(Locale.ROOT); }
    private String normalizeFilter(String value, Set<String> allowed, String message) {
        String status = blankToNull(value);
        if (status == null) return null;
        status = status.toUpperCase(Locale.ROOT);
        if (!allowed.contains(status)) throw badRequest(message);
        return status;
    }
    private String blankToNull(String value) { return value == null || value.isBlank() ? null : value.trim(); }
    private String requiredReason(String value, String message) {
        if (value == null || value.isBlank()) throw badRequest(message);
        String reason = value.trim();
        if (reason.length() > 1000) throw badRequest("Reason must be 1000 characters or fewer.");
        return reason;
    }
    private ResponseStatusException badRequest(String message) { return new ResponseStatusException(HttpStatus.BAD_REQUEST, message); }
    private ResponseStatusException conflict(String message) { return new ResponseStatusException(HttpStatus.CONFLICT, message); }
}
