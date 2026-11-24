package com.telusko.placement_portal.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public interface AdminJobProjection {
    Long getId();
    String getTitle();
    String getCompany();
    String getLocation();
    String getJobType();
    String getSalary();
    LocalDateTime getCreatedAt();
    LocalDate getDeadline();
    String getApprovalStatus();
    Boolean getClosed();
    Boolean getModerationFlagged();
    Long getRecruiterId();
    String getRecruiterName();
    String getRecruiterEmail();
}
