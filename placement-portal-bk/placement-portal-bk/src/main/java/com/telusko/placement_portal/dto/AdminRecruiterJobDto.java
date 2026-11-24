package com.telusko.placement_portal.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record AdminRecruiterJobDto(Long id, String title, String company, String jobType,
                                   LocalDateTime createdAt, LocalDate deadline,
                                   String status, long applications) {}
