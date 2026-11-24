package com.telusko.placement_portal.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PipelineStageChangeRequest(@NotBlank @Size(max = 40) String stage,
                                         boolean reopen,
                                         @Size(max = 1000) String note) { }
