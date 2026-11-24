package com.telusko.placement_portal.dto;

import java.time.LocalDateTime;
import java.util.List;

public record CandidateMatchDto(Long applicationId, Long studentId, String studentName, Long jobId,
        int matchScore, boolean matchScoreAvailable, String eligibilityStatus,
        List<String> matchedSkills, List<String> missingSkills, String branchMatchStatus,
        String cgpaMatchStatus, Integer skillMatchScore, Integer branchMatchScore,
        Integer cgpaMatchScore, String scoreExplanation, List<String> strengths,
        List<String> areasToImprove, List<String> eligibilityReasons,
        String applicationStatus, LocalDateTime appliedAt) { }
