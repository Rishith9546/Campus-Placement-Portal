package com.telusko.placement_portal.dto;
import com.telusko.placement_portal.entity.PreparationTask.*;
import java.time.*;
public record PreparationTaskDto(Long id,String title,String description,Category category,String topic,Priority priority,int priorityScore,int estimatedMinutes,LocalDate scheduledDate,TaskType taskType,String recommendationReason,Status status,String resourceLink,String notes,String skipReason,LocalDateTime completedAt,LocalDateTime reopenedAt,LocalDateTime createdAt,LocalDateTime updatedAt) { }
