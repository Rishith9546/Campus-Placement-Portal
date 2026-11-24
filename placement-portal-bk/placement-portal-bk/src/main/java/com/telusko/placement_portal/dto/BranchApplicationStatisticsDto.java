package com.telusko.placement_portal.dto;

public record BranchApplicationStatisticsDto(String branch, long totalStudents, long studentsApplied, long applications,
                                             long shortlistedApplications, long selectedApplications) {}
