package com.telusko.placement_portal.dto;

import java.util.List;

public record AdminJobPageDto(List<AdminJobListItem> content, int page, int size,
                              long totalElements, int totalPages, AdminJobStatisticsDto statistics,
                              List<String> companies, List<String> jobTypes) {}
