package com.telusko.placement_portal.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AdminJobRejectionRequest(@NotBlank @Size(max = 1000) String reason) {}
