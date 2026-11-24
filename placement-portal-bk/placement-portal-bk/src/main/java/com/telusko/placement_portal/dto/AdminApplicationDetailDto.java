package com.telusko.placement_portal.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record AdminApplicationDetailDto(Long applicationId, String status, LocalDateTime appliedAt,
                                        Long studentId, String studentName, String studentEmail, String rollNo,
                                        String branch, Double cgpa, String skills, boolean resumeAvailable,
                                        Long jobId, String jobTitle, String company, String recruiterName,
                                        String recruiterEmail, String location, String jobType, String salary,
                                        LocalDate deadline, List<ApplicationStageHistoryDto> statusHistory) {}
