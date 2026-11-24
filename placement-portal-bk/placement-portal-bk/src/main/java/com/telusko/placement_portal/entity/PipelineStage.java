package com.telusko.placement_portal.entity;

import java.util.Locale;

public enum PipelineStage {
    APPLIED, UNDER_REVIEW, SHORTLISTED, INTERVIEW_SCHEDULED, INTERVIEWED, SELECTED, REJECTED;

    public static PipelineStage parse(String value) {
        if (value == null || value.isBlank()) return APPLIED;
        try { return valueOf(value.trim().toUpperCase(Locale.ROOT)); }
        catch (IllegalArgumentException ignored) { return APPLIED; }
    }

    public boolean terminal() { return this == SELECTED || this == REJECTED; }
}
