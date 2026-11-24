package com.telusko.placement_portal.dto;

public record AdminJobStatisticsDto(long totalJobs, long pendingReview, long approvedJobs,
                                    long rejectedJobs, long activeJobs, long closedJobs,
                                    long expiredJobs, long flaggedJobs) {}
