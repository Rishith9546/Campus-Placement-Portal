package com.telusko.placement_portal.dto;

import java.time.LocalDate;

public record ComparisonProfileEntryDto(String title, String organization, String role,
        String description, String technologies, LocalDate startDate, LocalDate endDate) { }
