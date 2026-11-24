package com.telusko.placement_portal.dto;

public record AptitudePerformanceDto(String key, String label, int totalQuestions,
                                     int answeredQuestions, int correct, int incorrect,
                                     int unanswered, int accuracyPercentage,
                                     int scorePercentage) { }
