package com.telusko.placement_portal.dto;

import com.telusko.placement_portal.entity.AptitudeAttempt.Mode;
import com.telusko.placement_portal.entity.AptitudeAttempt.Status;
import com.telusko.placement_portal.entity.AptitudeQuestion.Category;
import com.telusko.placement_portal.entity.AptitudeQuestion.Topic;
import java.time.LocalDateTime;

public record AptitudeHistoryItemDto(Long attemptId, Mode mode, Status status, Category category,
                                     Topic topic, LocalDateTime startedAt, LocalDateTime submittedAt,
                                     int totalQuestions, Integer scorePercentage,
                                     Integer accuracyPercentage, Integer timeTakenSeconds) { }
