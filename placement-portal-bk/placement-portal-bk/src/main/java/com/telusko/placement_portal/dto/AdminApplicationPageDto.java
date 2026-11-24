package com.telusko.placement_portal.dto;

import java.util.List;

public record AdminApplicationPageDto(List<AdminApplicationRowDto> content, int page, int size, long totalElements,
                                     int totalPages, AdminApplicationStatisticsDto statistics,
                                     List<String> branches, List<String> companies) {}
