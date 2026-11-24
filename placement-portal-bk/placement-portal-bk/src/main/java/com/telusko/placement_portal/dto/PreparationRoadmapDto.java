package com.telusko.placement_portal.dto;
import com.telusko.placement_portal.entity.PreparationRoadmap.Status;
import java.time.*;
import java.util.*;
public record PreparationRoadmapDto(Long id,String name,LocalDate startDate,int durationWeeks,int dailyMinutes,String focus,String plannerSource,Status status,LocalDateTime createdAt,LocalDateTime updatedAt,int totalTasks,int completedTasks,int incompleteTasks,int skippedTasks,int completionPercentage,Map<String,Object> preparationSnapshot,List<PreparationTaskDto> tasks) { }
