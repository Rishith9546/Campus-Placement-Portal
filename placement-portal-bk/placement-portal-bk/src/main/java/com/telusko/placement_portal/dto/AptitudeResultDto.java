package com.telusko.placement_portal.dto;

import com.telusko.placement_portal.entity.AptitudeAttempt.Mode;
import com.telusko.placement_portal.entity.AptitudeAttempt.Status;
import com.telusko.placement_portal.entity.AptitudeQuestion.Category;
import com.telusko.placement_portal.entity.AptitudeQuestion.Difficulty;
import com.telusko.placement_portal.entity.AptitudeQuestion.Topic;
import java.time.LocalDateTime;
import java.util.List;

public record AptitudeResultDto(Long attemptId, Mode mode, Status status, Category category,
                                Topic topic, Difficulty difficulty, LocalDateTime startedAt,
                                LocalDateTime submittedAt, int totalQuestions, int correct,
                                int incorrect, int unanswered, int scorePercentage,
                                int accuracyPercentage, int timeTakenSeconds,
                                List<AptitudePerformanceDto> categoryPerformance,
                                List<AptitudePerformanceDto> topicPerformance,
                                List<AptitudePerformanceDto> difficultyPerformance,
                                List<AptitudeQuestionReviewDto> questions) { }
