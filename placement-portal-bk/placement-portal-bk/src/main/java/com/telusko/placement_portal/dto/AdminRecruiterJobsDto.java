package com.telusko.placement_portal.dto;

import java.util.List;

public record AdminRecruiterJobsDto(long totalJobs, long activeJobs, long closedJobs,
                                   long totalApplications, List<AdminRecruiterJobDto> recentJobs) {}
