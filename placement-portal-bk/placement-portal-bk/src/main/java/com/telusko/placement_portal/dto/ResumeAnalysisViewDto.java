package com.telusko.placement_portal.dto;
import com.telusko.placement_portal.entity.ResumeAnalysis.Status;
import java.time.LocalDateTime;
import java.util.Map;
public record ResumeAnalysisViewDto(Long id,String resumeFilename,Integer score,Integer jobMatchScore,
                                    Long jobId,String jobTitle,String jobCompany,String modelIdentifier,
                                    Status status,String userMessage,LocalDateTime analyzedAt,
                                    Map<String,Object> analysis) { }
