package com.telusko.placement_portal.dto;

public record AdminRecruiterDetailsDto(Long id, String name, String email, String companyName,
                                       boolean enabled, String verificationStatus,
                                       String phone, String companyWebsite, String companyDescription,
                                       String companyLocation, String industry, String companySize,
                                       String companyLogo, String createdAt,
                                       long totalJobs, long activeJobs, long closedJobs,
                                       long totalApplications) {}
