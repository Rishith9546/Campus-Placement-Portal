package com.telusko.placement_portal.dto;

import com.telusko.placement_portal.entity.DsaProblem.Difficulty;
import com.telusko.placement_portal.entity.DsaProblem.Platform;
import com.telusko.placement_portal.entity.DsaProblem.ProblemStatus;
import com.telusko.placement_portal.entity.DsaProblem.Topic;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record DsaProblemRequest(
        @NotBlank @Size(max = 180) String title,
        @Size(max = 800) String problemUrl,
        @NotNull Platform platform,
        @NotNull Topic topic,
        @NotNull Difficulty difficulty,
        @NotNull ProblemStatus status,
        LocalDate solvedAt,
        @Size(max = 3000) String notes,
        @Size(max = 80) String timeComplexity,
        @Size(max = 80) String spaceComplexity) { }
