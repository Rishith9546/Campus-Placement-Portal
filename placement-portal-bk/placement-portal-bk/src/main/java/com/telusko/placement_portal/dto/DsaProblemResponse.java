package com.telusko.placement_portal.dto;

import com.telusko.placement_portal.entity.DsaProblem.Difficulty;
import com.telusko.placement_portal.entity.DsaProblem.Platform;
import com.telusko.placement_portal.entity.DsaProblem.ProblemStatus;
import com.telusko.placement_portal.entity.DsaProblem.Topic;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record DsaProblemResponse(
        Long id, String title, String problemUrl, Platform platform, Topic topic,
        Difficulty difficulty, ProblemStatus status, LocalDate solvedAt, String notes,
        String timeComplexity, String spaceComplexity, LocalDateTime createdAt,
        LocalDateTime updatedAt) { }
