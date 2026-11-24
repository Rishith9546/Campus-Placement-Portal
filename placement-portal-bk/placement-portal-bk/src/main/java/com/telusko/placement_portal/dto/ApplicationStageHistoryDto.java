package com.telusko.placement_portal.dto;

import java.time.LocalDateTime;

public record ApplicationStageHistoryDto(Long id, Long applicationId, String previousStage,
        String newStage, Long changedByRecruiterId, LocalDateTime changedAt, String note) { }
