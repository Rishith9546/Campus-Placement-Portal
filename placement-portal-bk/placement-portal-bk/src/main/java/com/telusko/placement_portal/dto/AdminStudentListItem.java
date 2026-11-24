package com.telusko.placement_portal.dto;

public record AdminStudentListItem(
        Long id,
        String name,
        String email,
        boolean enabled,
        String rollNo,
        String branch,
        Double cgpa,
        String skills,
        String profilePhoto,
        Integer graduationYear
) {}
