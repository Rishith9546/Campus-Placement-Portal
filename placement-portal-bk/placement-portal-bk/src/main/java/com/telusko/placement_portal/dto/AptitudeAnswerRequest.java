package com.telusko.placement_portal.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public record AptitudeAnswerRequest(
        @Min(0) @Max(3) Integer selectedOptionIndex,
        boolean markedForReview) { }
