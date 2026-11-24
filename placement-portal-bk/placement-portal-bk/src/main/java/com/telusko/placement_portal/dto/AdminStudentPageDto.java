package com.telusko.placement_portal.dto;

import java.util.List;

public record AdminStudentPageDto(
        List<AdminStudentListItem> content,
        int page,
        int size,
        long totalElements,
        int totalPages,
        long totalStudents
) {}
