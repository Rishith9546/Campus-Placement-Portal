package com.telusko.placement_portal.dto;

import com.telusko.placement_portal.entity.StudentProfileEntry.EntryType;
import java.time.LocalDate;

public record StudentProfileEntryResponse(
        Long id, EntryType type, String title, String organization, String role,
        String description, String technologies, String repositoryUrl, String liveUrl,
        String credentialUrl, LocalDate startDate, LocalDate endDate, LocalDate issueDate) { }
