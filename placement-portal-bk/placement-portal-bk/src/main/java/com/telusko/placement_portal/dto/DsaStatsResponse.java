package com.telusko.placement_portal.dto;

import java.util.List;
import java.util.Map;

public record DsaStatsResponse(
        long totalProblems,
        long solvedCount,
        long attemptedCount,
        long inProgressCount,
        long easySolved,
        long mediumSolved,
        long hardSolved,
        Map<String, Long> difficultyDistribution,
        int overallProgressPercentage,
        int readinessScore,
        int solvedBenchmark,
        int topicCoveragePercentage,
        long solvedTopicsCount,
        int availableTopicCount,
        List<DsaTopicProgress> topics,
        List<DsaProblemResponse> recentActivity) { }
