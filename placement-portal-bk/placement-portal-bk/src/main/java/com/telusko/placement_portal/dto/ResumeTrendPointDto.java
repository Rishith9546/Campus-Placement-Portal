package com.telusko.placement_portal.dto;
import java.time.LocalDateTime;
import java.util.Map;
public record ResumeTrendPointDto(Long id,LocalDateTime analyzedAt,String resumeFilename,Integer score,
                                  Integer jobMatchScore,Map<String,Object> categories) { }
