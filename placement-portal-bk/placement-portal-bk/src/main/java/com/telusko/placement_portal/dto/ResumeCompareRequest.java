package com.telusko.placement_portal.dto;
import jakarta.validation.constraints.NotNull;
public record ResumeCompareRequest(@NotNull Long firstAnalysisId,@NotNull Long secondAnalysisId) { }
