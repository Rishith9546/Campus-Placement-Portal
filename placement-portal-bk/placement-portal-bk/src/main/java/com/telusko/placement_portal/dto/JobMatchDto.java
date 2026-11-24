package com.telusko.placement_portal.dto;

import java.time.LocalDate;
import java.util.List;

public record JobMatchDto(Long jobId, String title, String company, String location, String jobType,
                          String salary, LocalDate deadline, String description, String eligibility,
                          String eligibilityStatus, List<String> eligibilityReasons,
                          int matchScore, boolean matchScoreAvailable,
                          Integer skillMatchScore, Integer branchMatchScore, Integer cgpaMatchScore,
                          List<String> requiredSkills, List<String> matchedSkills,
                          List<String> missingSkills, List<String> preferredSkills,
                          Double minimumCgpa, List<String> eligibleBranches, Integer maximumBacklogs,
                          Integer minimumGraduationYear, Integer maximumGraduationYear,
                          List<String> recommendedSkills, String applicationStatus,
                          boolean applied, boolean active) { }
