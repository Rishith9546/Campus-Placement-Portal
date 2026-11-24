package com.telusko.placement_portal.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

public record CandidateComparisonRequest(@NotEmpty @Size(min = 2, max = 5) List<@NotNull Long> applicationIds) { }
