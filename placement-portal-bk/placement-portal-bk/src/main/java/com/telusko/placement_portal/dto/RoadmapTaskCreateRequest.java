package com.telusko.placement_portal.dto;
import com.telusko.placement_portal.entity.PreparationTask.Category;
import com.telusko.placement_portal.entity.PreparationTask.Priority;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
public record RoadmapTaskCreateRequest(@NotBlank @Size(max=180) String title,@NotBlank @Size(max=5000) String description,@NotNull Category category,@Size(max=120) String topic,@NotNull Priority priority,@Min(5) @Max(480) int estimatedMinutes,@NotNull LocalDate scheduledDate,@Size(max=800) String resourceLink,@Size(max=5000) String notes) { }
