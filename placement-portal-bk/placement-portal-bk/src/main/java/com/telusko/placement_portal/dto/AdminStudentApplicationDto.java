package com.telusko.placement_portal.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record AdminStudentApplicationDto(Long id, Long jobId, String jobTitle, String company,
                                         String status, LocalDateTime appliedAt, LocalDate deadline) {}
