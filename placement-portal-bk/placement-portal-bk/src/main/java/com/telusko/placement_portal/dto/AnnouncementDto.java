package com.telusko.placement_portal.dto;

import java.time.LocalDateTime;

public record AnnouncementDto(Long id,String title,String content,String audience,String branch,String priority,String status,
                             LocalDateTime publishAt,LocalDateTime expiresAt,Long createdByAdminId,LocalDateTime createdAt,LocalDateTime updatedAt) {}
