package com.telusko.placement_portal.dto;

public record AptitudeAnswerResultDto(boolean expired, Integer selectedOptionIndex,
                                      Integer correctOptionIndex, String correctAnswer,
                                      String explanation, Boolean correct) { }
