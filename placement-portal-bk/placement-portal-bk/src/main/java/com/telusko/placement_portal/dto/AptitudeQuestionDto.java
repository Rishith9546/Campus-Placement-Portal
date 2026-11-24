package com.telusko.placement_portal.dto;

import com.telusko.placement_portal.entity.AptitudeQuestion.Category;
import com.telusko.placement_portal.entity.AptitudeQuestion.Difficulty;
import com.telusko.placement_portal.entity.AptitudeQuestion.Topic;
import java.util.List;

public record AptitudeQuestionDto(Long attemptQuestionId, int position, String questionText,
                                  Category category, Topic topic, Difficulty difficulty,
                                  List<AptitudeOptionDto> options, Integer selectedOptionIndex,
                                  boolean markedForReview) { }
