package com.telusko.placement_portal.dto;

import com.telusko.placement_portal.entity.AptitudeAttempt.Mode;
import com.telusko.placement_portal.entity.AptitudeQuestion.Category;
import com.telusko.placement_portal.entity.AptitudeQuestion.Difficulty;
import com.telusko.placement_portal.entity.AptitudeQuestion.Topic;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record AptitudeStartRequest(
        @NotNull Mode mode,
        Category category,
        Topic topic,
        Difficulty difficulty,
        @Min(1) @Max(30) int questionCount,
        @Min(60) @Max(3600) Integer durationSeconds) { }
