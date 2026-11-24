package com.telusko.placement_portal.dto;

import java.util.List;

public record JobMatchSummaryDto(int activeJobCount, int eligibleCount, int needsReviewCount,
                                 int highMatchCount, int appliedCount, int averageMatchScore,
                                 JobMatchDto topMatch, JobMatchDto bestEligibleMatch,
                                 List<String> focusSkills, List<JobMatchDto> matches) { }
