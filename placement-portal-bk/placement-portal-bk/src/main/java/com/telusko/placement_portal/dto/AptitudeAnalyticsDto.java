package com.telusko.placement_portal.dto;

import java.time.LocalDateTime;
import java.util.List;

public record AptitudeAnalyticsDto(int completedAttempts, int answeredQuestions,
                                  int correctAnswers, int averageAccuracy,
                                  int averageScore, Integer latestScore,
                                  Integer latestAccuracy, LocalDateTime latestAttemptAt,
                                  Integer aptitudeReadinessScore, String readinessDetail,
                                  Integer consistencyScore, int topicCoveragePercentage,
                                  int attemptedTopicCount, int availableTopicCount,
                                  int weakTopicMinimumQuestions,
                                  List<AptitudeTopicStatDto> weakTopics,
                                  List<AptitudeTopicStatDto> strongTopics,
                                  List<AptitudeTopicStatDto> topicPerformance,
                                  List<AptitudePerformanceDto> categoryPerformance,
                                  List<AptitudePerformanceDto> difficultyPerformance,
                                  List<AptitudeHistoryItemDto> recentAttempts) { }
