package com.telusko.placement_portal.dto;

import com.telusko.placement_portal.entity.AptitudeQuestion.Topic;

public record AptitudeCatalogTopicDto(Topic key, String label, long questionCount) { }
