package com.telusko.placement_portal.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record AdminJobListItem(Long id, String title, String company, String location, String jobType,
                               String salary, LocalDateTime createdAt, LocalDate deadline,
                               String approvalStatus, String jobStatus, boolean moderationFlagged,
                               Long recruiterId, String recruiterName, String recruiterEmail,
                               long applications) {}
