package com.telusko.placement_portal.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record InterviewScheduleRequest(@NotBlank @Size(max = 2048) String interviewLink) { }
