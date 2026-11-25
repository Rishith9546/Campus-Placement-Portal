package com.telusko.placement_portal.dto;

import jakarta.validation.constraints.*;

public record StudentAcademicRequest(
        @NotBlank @Size(max=180) String collegeName,
        @NotBlank @Size(max=80) String rollNo,
        @NotBlank @Size(max=100) String branch,
        @NotBlank @Size(max=120) String degree,
        @NotNull @Min(2000) @Max(2100) Integer graduationYear,
        @NotNull @DecimalMin("0.0") @DecimalMax("10.0") Double cgpa,
        @Min(0) @Max(100) Integer backlogs
) { }
