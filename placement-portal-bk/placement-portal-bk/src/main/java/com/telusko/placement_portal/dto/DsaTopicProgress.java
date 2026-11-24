package com.telusko.placement_portal.dto;

import com.telusko.placement_portal.entity.DsaProblem.Topic;

public record DsaTopicProgress(Topic topic, long totalLogged, long solved, long attempted,
                               long inProgress, int progressPercentage) { }
