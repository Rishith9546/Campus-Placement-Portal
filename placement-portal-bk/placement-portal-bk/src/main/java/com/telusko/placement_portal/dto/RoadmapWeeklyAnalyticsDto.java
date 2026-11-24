package com.telusko.placement_portal.dto;
import java.time.LocalDate;
import java.util.*;
public record RoadmapWeeklyAnalyticsDto(LocalDate weekStart,LocalDate weekEnd,int plannedTasks,int completedTasks,int incompleteTasks,int missedTasks,int completionPercentage,int plannedStudyMinutes,Integer actualStudyMinutes,boolean actualStudyTimeTracked,Map<String,Integer> categoryTaskCounts,List<String> dsaTopicsWorked,List<String> currentWeakAreas,Map<String,Object> moduleChanges,Map<String,String> moduleAvailability) { }
