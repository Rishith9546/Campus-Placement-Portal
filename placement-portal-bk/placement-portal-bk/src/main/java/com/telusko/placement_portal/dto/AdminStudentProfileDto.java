package com.telusko.placement_portal.dto;

import java.util.List;

public record AdminStudentProfileDto(
        Long id,
        String name,
        String email,
        boolean enabled,
        String phone,
        String rollNo,
        String branch,
        Double cgpa,
        String skills,
        String profilePhoto,
        boolean resumeAvailable,
        String collegeName,
        String degree,
        Integer graduationYear,
        Integer backlogs,
        String githubProfile,
        String linkedInProfile,
        String portfolioUrl,
        Long totalApplications,
        Long shortlistedApplications,
        Long rejectedApplications,
        Long selectedApplications,
        List<ProfileEntry> profileEntries
) {
    public record ProfileEntry(String type, String title, String organization, String role, String description,
                               String technologies, String repositoryUrl, String liveUrl, String credentialUrl,
                               java.time.LocalDate startDate, java.time.LocalDate endDate, java.time.LocalDate issueDate) {}
}
