package com.telusko.placement_portal.dto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
public record ResumeImprovementRequest(@NotBlank @Size(max=50) String section,@NotBlank @Size(max=12000) String originalText,@Size(max=2000) String instructions) { }
