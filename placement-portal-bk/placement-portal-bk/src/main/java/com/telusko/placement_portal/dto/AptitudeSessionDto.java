package com.telusko.placement_portal.dto;

import com.telusko.placement_portal.entity.AptitudeAttempt.Mode;
import com.telusko.placement_portal.entity.AptitudeAttempt.Status;
import com.telusko.placement_portal.entity.AptitudeQuestion.Category;
import com.telusko.placement_portal.entity.AptitudeQuestion.Difficulty;
import com.telusko.placement_portal.entity.AptitudeQuestion.Topic;
import java.time.LocalDateTime;
import java.util.List;

public record AptitudeSessionDto(Long id, Mode mode, Status status, Category category, Topic topic,
                                 Difficulty difficulty, int questionCount, int answeredCount,
                                 LocalDateTime startedAt, LocalDateTime expiresAt,
                                 List<AptitudeQuestionDto> questions) { }
