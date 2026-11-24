package com.telusko.placement_portal.dto;

import java.time.LocalDateTime;

public record AdminApplicationRowDto(Long applicationId, Long studentId, String studentName, String studentEmail,
                                     String rollNo, String branch, Double cgpa, Long jobId, String jobTitle,
                                     String company, LocalDateTime appliedAt, String status) {}
