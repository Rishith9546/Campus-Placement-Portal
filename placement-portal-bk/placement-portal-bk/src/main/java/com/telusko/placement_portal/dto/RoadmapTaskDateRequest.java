package com.telusko.placement_portal.dto;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
public record RoadmapTaskDateRequest(@NotNull LocalDate scheduledDate) { }
