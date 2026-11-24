package com.telusko.placement_portal.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;

public record AdminJobDetailsDto(Long id, String title, String company, String location, String jobType,
                                 String salary, String description, String responsibilities, String eligibility,
                                 String skills, LocalDate deadline, LocalDateTime createdAt,
                                 Long recruiterId, String recruiterName, String recruiterEmail,
                                 String recruiterVerificationStatus, String approvalStatus, String rejectionReason,
                                 String jobStatus, boolean closed, boolean moderationFlagged, String moderationReason,
                                 long totalApplications, Map<String, Long> applicationStatuses) {}
