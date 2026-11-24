package com.telusko.placement_portal.dto;

import java.util.List;

public record ComparisonMatchDto(int score, boolean scoreAvailable, String eligibilityStatus,
        Integer skillsScore, Integer branchScore, Integer cgpaScore,
        String branchStatus, String cgpaStatus,
        Double minimumCgpa, List<String> eligibleBranches, String jobEligibilityCriteria,
        List<String> requiredSkills, List<String> matchedSkills, List<String> missingSkills, String explanation) { }
