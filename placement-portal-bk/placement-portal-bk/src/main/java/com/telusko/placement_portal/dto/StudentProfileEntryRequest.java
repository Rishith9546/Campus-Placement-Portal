package com.telusko.placement_portal.dto;

import com.telusko.placement_portal.entity.StudentProfileEntry.EntryType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record StudentProfileEntryRequest(
        @NotNull EntryType type,
        @NotBlank @Size(max = 180) String title,
        @Size(max = 180) String organization,
        @Size(max = 180) String role,
        @Size(max = 3000) String description,
        @Size(max = 1000) String technologies,
        @Size(max = 500) String repositoryUrl,
        @Size(max = 500) String liveUrl,
        @Size(max = 500) String credentialUrl,
        LocalDate startDate,
        LocalDate endDate,
        LocalDate issueDate) { }
