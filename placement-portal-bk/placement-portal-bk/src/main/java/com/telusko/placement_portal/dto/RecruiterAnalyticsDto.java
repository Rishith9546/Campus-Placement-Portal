package com.telusko.placement_portal.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record RecruiterAnalyticsDto(
        long totalJobs,
        long activeJobs,
        long closedJobs,
        long totalApplications,
        long applied,
        long underReview,
        long shortlisted,
        long interviewScheduled,
        long interviewed,
        long selected,
        long rejected,
        List<MonthlyApplications> monthlyApplications,
        List<JobPerformance> jobPerformance,
        boolean jobViewTrackingAvailable,
        LocalDateTime generatedAt) {

    public record MonthlyApplications(String month, long applications) { }
    public record JobPerformance(Long jobId, String title, String company, LocalDate deadline,
                                 boolean active, long applications, long underReview,
                                 long shortlisted, long interviewScheduled, long interviewed,
                                 long selected, long rejected) { }
}
