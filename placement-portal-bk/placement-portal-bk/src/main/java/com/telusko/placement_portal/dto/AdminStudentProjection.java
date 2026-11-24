package com.telusko.placement_portal.dto;

public interface AdminStudentProjection {
    Long getId();
    String getName();
    String getEmail();
    Boolean getEnabled();
    String getRollNo();
    String getBranch();
    Double getCgpa();
    String getSkills();
    String getProfilePhoto();
    Integer getGraduationYear();
}
