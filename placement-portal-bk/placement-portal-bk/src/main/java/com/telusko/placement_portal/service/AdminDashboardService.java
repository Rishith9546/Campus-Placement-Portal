package com.telusko.placement_portal.service;

import com.telusko.placement_portal.dto.AdminDashboardOverviewDto;
import com.telusko.placement_portal.entity.Job;
import com.telusko.placement_portal.entity.application;
import com.telusko.placement_portal.repository.ApplicationRepo;
import com.telusko.placement_portal.repository.JobRepo;
import com.telusko.placement_portal.repository.StudentRepo;
import com.telusko.placement_portal.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class AdminDashboardService {
    private static final int ACTIVITY_LIMIT = 10;

    private final UserRepository users;
    private final StudentRepo students;
    private final JobRepo jobs;
    private final ApplicationRepo applications;

    public AdminDashboardService(UserRepository users, StudentRepo students, JobRepo jobs, ApplicationRepo applications) {
        this.users = users;
        this.students = students;
        this.jobs = jobs;
        this.applications = applications;
    }

    @Transactional(readOnly = true)
    public AdminDashboardOverviewDto getOverview() {
        LocalDate today = LocalDate.now();
        long totalJobs = jobs.count();
        long activeJobs = jobs.countByDeadlineGreaterThanEqual(today);
        long closedJobs = jobs.countByDeadlineLessThan(today);
        long undatedJobs = Math.max(0, totalJobs - activeJobs - closedJobs);

        Map<String, Long> stats = new LinkedHashMap<>();
        stats.put("students", users.countByRole("STUDENT"));
        stats.put("recruiters", users.countByRole("RECRUITER"));
        stats.put("companies", users.countRecruiterCompanies());
        stats.put("jobs", totalJobs);
        stats.put("activeJobs", activeJobs);
        stats.put("closedJobs", closedJobs);
        stats.put("applications", applications.count());
        stats.put("shortlisted", applications.countByStatusIgnoreCase("SHORTLISTED"));

        Map<String, Long> applicationStatuses = new LinkedHashMap<>();
        for (Object[] row : applications.countGroupedByStatus()) {
            String status = row[0] == null || row[0].toString().isBlank() ? "APPLIED" : row[0].toString().trim().toUpperCase(Locale.ROOT);
            applicationStatuses.merge(status, ((Number) row[1]).longValue(), Long::sum);
        }
        for (String stage : List.of("APPLIED", "UNDER_REVIEW", "SHORTLISTED", "INTERVIEW_SCHEDULED", "INTERVIEWED", "SELECTED", "REJECTED")) {
            applicationStatuses.putIfAbsent(stage, 0L);
        }

        Map<String, Long> jobStatuses = new LinkedHashMap<>();
        jobStatuses.put("ACTIVE", activeJobs);
        jobStatuses.put("CLOSED", closedJobs);
        jobStatuses.put("UNDATED", undatedJobs);

        Map<String, Long> branches = new LinkedHashMap<>();
        for (Object[] row : students.countGroupedByBranch()) {
            String branch = row[0] == null || row[0].toString().isBlank() ? "Not specified" : row[0].toString().trim();
            branches.merge(branch, ((Number) row[1]).longValue(), Long::sum);
        }

        List<AdminDashboardOverviewDto.Activity> activity = new ArrayList<>();
        for (Job job : jobs.findTop8ByCreatedAtIsNotNullOrderByCreatedAtDesc()) {
            activity.add(new AdminDashboardOverviewDto.Activity("JOB", "Job posted", safe(job.getTitle(), "Untitled role") + " · " + safe(job.getCompany(), "Company unavailable"), job.getCreatedAt()));
        }
        for (application app : applications.findTop8ByAppliedAtIsNotNullOrderByAppliedAtDesc()) {
            String status = app.getStatus() == null || app.getStatus().isBlank() ? "APPLIED" : app.getStatus().toUpperCase(Locale.ROOT);
            activity.add(new AdminDashboardOverviewDto.Activity("APPLICATION", "Application received", "Application #" + app.getId() + " · Job #" + app.getJobId() + " · " + status.replace('_', ' '), app.getAppliedAt()));
        }
        activity.sort(Comparator.comparing(AdminDashboardOverviewDto.Activity::timestamp).reversed());
        if (activity.size() > ACTIVITY_LIMIT) activity = new ArrayList<>(activity.subList(0, ACTIVITY_LIMIT));

        return new AdminDashboardOverviewDto(stats, applicationStatuses, jobStatuses, branches, activity, false);
    }

    private String safe(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value.trim();
    }
}
