package com.telusko.placement_portal.dto;

import jakarta.validation.constraints.NotNull;

public record AdminRecruiterStatusRequest(@NotNull Boolean enabled) {}
