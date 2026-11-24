package com.telusko.placement_portal.dto;

import jakarta.validation.constraints.NotNull;

public record AdminStudentStatusRequest(@NotNull Boolean enabled) {}
