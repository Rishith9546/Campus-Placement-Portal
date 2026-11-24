package com.telusko.placement_portal.dto;

import java.util.List;
import java.util.Map;

public record AdminApplicationStatisticsDto(long totalApplications, long applied, long shortlisted, long rejected,
                                            long selected, long uniqueStudentsApplied, long studentsWithoutApplications,
                                            boolean placementDataAvailable, List<BranchApplicationStatisticsDto> byBranch,
                                            List<CompanyApplicationStatisticsDto> byCompany, Map<String, Long> statuses) {}
