package com.telusko.placement_portal.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

public record AnnouncementRequest(@NotBlank @Size(max=180) String title,@NotBlank @Size(max=12000) String content,
                                  @NotBlank String audience,@Size(max=100) String branch,
                                  @NotBlank String priority,LocalDateTime publishAt,LocalDateTime expiresAt) {}
