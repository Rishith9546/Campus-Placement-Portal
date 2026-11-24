package com.telusko.placement_portal.dto;

import java.time.LocalDateTime;
import java.util.List;

public record CandidateComparisonDto(Long applicationId, Long studentId, String studentName,
        boolean profileAvailable, String branch, Double cgpa, String skills,
        LocalDateTime appliedAt, String currentStage, boolean resumeAvailable,
        ComparisonMatchDto match, List<ComparisonProfileEntryDto> projects,
        List<ComparisonProfileEntryDto> experience) { }
