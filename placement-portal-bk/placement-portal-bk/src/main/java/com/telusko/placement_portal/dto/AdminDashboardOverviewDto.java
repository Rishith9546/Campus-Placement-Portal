package com.telusko.placement_portal.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public record AdminDashboardOverviewDto(
        Map<String, Long> statistics,
        Map<String, Long> applicationStatuses,
        Map<String, Long> jobStatuses,
        Map<String, Long> studentsByBranch,
        List<Activity> recentActivity,
        boolean placementDataAvailable
) {
    public record Activity(String type, String title, String description, LocalDateTime timestamp) {}
}
