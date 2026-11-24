package com.telusko.placement_portal.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public interface AdminApplicationProjection {
    Long getApplicationId(); Long getStudentId(); String getStudentName(); String getStudentEmail(); String getRollNo();
    String getBranch(); Double getCgpa(); String getSkills(); Long getJobId(); String getJobTitle();
    String getCompany(); String getLocation(); String getJobType(); String getSalary(); LocalDate getDeadline();
    Long getRecruiterId(); String getRecruiterName(); LocalDateTime getAppliedAt(); String getStatus();
}
