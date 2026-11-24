package com.telusko.placement_portal.dto;

import jakarta.validation.constraints.NotBlank;

public record AdminRecruiterVerificationRequest(@NotBlank String status) {}
