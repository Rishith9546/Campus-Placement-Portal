package com.telusko.placement_portal.dto;

import com.telusko.placement_portal.entity.AptitudeQuestion.Category;
import com.telusko.placement_portal.entity.AptitudeQuestion.Topic;

public record AptitudeTopicStatDto(Category category, Topic topic, int questionsAttempted,
                                   int correct, int accuracyPercentage, boolean weak,
                                   boolean strong) { }
