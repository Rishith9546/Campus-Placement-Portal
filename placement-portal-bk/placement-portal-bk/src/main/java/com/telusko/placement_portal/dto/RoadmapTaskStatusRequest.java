package com.telusko.placement_portal.dto;
import com.telusko.placement_portal.entity.PreparationTask.Status;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
public record RoadmapTaskStatusRequest(@NotNull Status status,@Size(max=500) String skipReason) { }
