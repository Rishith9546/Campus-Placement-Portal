package com.telusko.placement_portal.dto;

public interface AdminRecruiterProjection {
    Long getId();
    String getName();
    String getEmail();
    String getCompanyName();
    Boolean getEnabled();
    String getVerificationStatus();
}
