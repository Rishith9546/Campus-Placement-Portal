package com.telusko.placement_portal.dto;

public record AdminRecruiterListItem(Long id, String name, String email, String companyName,
                                     boolean enabled, String verificationStatus, long totalJobs) {}
