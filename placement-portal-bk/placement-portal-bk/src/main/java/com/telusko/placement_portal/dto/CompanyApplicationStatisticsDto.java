package com.telusko.placement_portal.dto;

public record CompanyApplicationStatisticsDto(String company, long jobsPosted, long applications, long shortlisted,
                                               long selected) {}
