package com.telusko.placement_portal.dto;

import java.util.List;

public record AdminRecruiterPageDto(List<AdminRecruiterListItem> content, int page, int size,
                                    long totalElements, int totalPages, AdminRecruiterStatsDto stats) {}
