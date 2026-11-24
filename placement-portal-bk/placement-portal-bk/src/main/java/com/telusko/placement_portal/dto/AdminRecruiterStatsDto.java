package com.telusko.placement_portal.dto;

public record AdminRecruiterStatsDto(long totalRecruiters, long verifiedRecruiters,
                                     long pendingVerification, long rejectedVerification,
                                     long activeRecruiters, long inactiveRecruiters) {}
