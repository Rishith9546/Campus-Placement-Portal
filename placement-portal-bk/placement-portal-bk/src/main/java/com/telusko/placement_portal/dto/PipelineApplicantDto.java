package com.telusko.placement_portal.dto;

import java.time.LocalDateTime;

public record PipelineApplicantDto(Long applicationId, Long studentId, String studentName,
        String studentEmail, String phone, String branch, Double cgpa, String skills, String resume,
        Long jobId, String jobTitle, String company, LocalDateTime appliedAt, String stage) { }
