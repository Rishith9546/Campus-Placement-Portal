package com.telusko.placement_portal.service;

import com.telusko.placement_portal.dto.RecruiterAnalyticsDto;
import com.telusko.placement_portal.entity.Job;
import com.telusko.placement_portal.entity.application;
import com.telusko.placement_portal.repository.ApplicationRepo;
import com.telusko.placement_portal.repository.JobRepo;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class RecruiterAnalyticsServiceTest {
    private JobRepo jobs;
    private ApplicationRepo applications;
    private RecruiterAnalyticsService service;

    @BeforeEach void setUp() {
        jobs = mock(JobRepo.class); applications = mock(ApplicationRepo.class);
        service = new RecruiterAnalyticsService(jobs, applications);
    }

    @Test void aggregatesOnlyRecruiterJobsAndEverySupportedPipelineStage() {
        Job active = job(1L, null); Job closed = job(2L, LocalDate.now().minusDays(1));
        when(jobs.findByRecruiterId(9L)).thenReturn(List.of(active, closed));
        when(applications.findByJobIdInOrderByAppliedAtAscIdAsc(List.of(1L, 2L))).thenReturn(List.of(
                app(1L, "APPLIED"), app(1L, "UNDER_REVIEW"), app(1L, "SHORTLISTED"),
                app(2L, "INTERVIEW_SCHEDULED"), app(2L, "INTERVIEWED"), app(2L, "SELECTED"), app(2L, "REJECTED")));

        RecruiterAnalyticsDto result = service.getAnalytics(9L);

        assertEquals(2, result.totalJobs()); assertEquals(1, result.activeJobs()); assertEquals(1, result.closedJobs());
        assertEquals(7, result.totalApplications());
        assertEquals(1, result.applied()); assertEquals(1, result.underReview()); assertEquals(1, result.shortlisted());
        assertEquals(1, result.interviewScheduled()); assertEquals(1, result.interviewed());
        assertEquals(1, result.selected()); assertEquals(1, result.rejected());
        assertEquals(2, result.jobPerformance().size());
        assertFalse(result.jobViewTrackingAvailable());
        verify(jobs).findByRecruiterId(9L);
    }

    @Test void emptyRecruiterHasZeroCountsAndDoesNotQueryApplications() {
        when(jobs.findByRecruiterId(9L)).thenReturn(List.of());
        RecruiterAnalyticsDto result = service.getAnalytics(9L);
        assertEquals(0, result.totalJobs()); assertEquals(0, result.totalApplications());
        assertEquals(0, result.applied()); assertEquals(6, result.monthlyApplications().size());
        assertTrue(result.jobPerformance().isEmpty());
        verify(applications, never()).findByJobIdInOrderByAppliedAtAscIdAsc(anyList());
    }

    @Test void legacyUnknownStatusIsCountedAsAppliedAndMissingDatesAreNotInMonthlyTrend() {
        when(jobs.findByRecruiterId(9L)).thenReturn(List.of(job(1L, null)));
        application legacy = app(1L, "old-status"); legacy.setAppliedAt(null);
        when(applications.findByJobIdInOrderByAppliedAtAscIdAsc(List.of(1L))).thenReturn(List.of(legacy));
        RecruiterAnalyticsDto result = service.getAnalytics(9L);
        assertEquals(1, result.applied());
        assertTrue(result.monthlyApplications().stream().allMatch(m -> m.applications() == 0));
    }

    private Job job(Long id, LocalDate deadline) { Job job = new Job(); job.setId(id); job.setDeadline(deadline); job.setTitle("Role " + id); return job; }
    private application app(Long jobId, String status) { application app = new application(); app.setJobId(jobId); app.setStatus(status); app.setAppliedAt(LocalDateTime.now()); return app; }
}
