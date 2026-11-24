package com.telusko.placement_portal.dto;
import jakarta.validation.constraints.Size;
public record RoadmapTaskNotesRequest(@Size(max=5000) String notes) { }
