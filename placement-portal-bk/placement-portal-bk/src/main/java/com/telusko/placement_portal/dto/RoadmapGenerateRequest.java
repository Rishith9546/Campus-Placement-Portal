package com.telusko.placement_portal.dto;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
public record RoadmapGenerateRequest(@Min(1) @Max(4) int durationWeeks,@Min(15) @Max(480) int dailyMinutes,@NotNull LocalDate startDate,@Size(max=500) String focus) { }
