package com.telusko.placement_portal.service;

import com.telusko.placement_portal.dto.AdminDashboardOverviewDto;
import com.telusko.placement_portal.entity.Job;
import com.telusko.placement_portal.entity.application;
import com.telusko.placement_portal.repository.ApplicationRepo;
import com.telusko.placement_portal.repository.JobRepo;
import com.telusko.placement_portal.repository.StudentRepo;
import com.telusko.placement_portal.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AdminDashboardServiceTest {
    private UserRepository users;
    private StudentRepo students;
    private JobRepo jobs;
    private ApplicationRepo applications;
    private AdminDashboardService service;

    @BeforeEach void setUp() {
        users = mock(UserRepository.class);
        students = mock(StudentRepo.class);
        jobs = mock(JobRepo.class);
        applications = mock(ApplicationRepo.class);
        service = new AdminDashboardService(users, students, jobs, applications);
    }

    @Test void buildsCountsChartsAndRecentActivityFromAggregates() {
        when(users.countByRole("STUDENT")).thenReturn(12L);
        when(users.countByRole("RECRUITER")).thenReturn(3L);
        when(users.countRecruiterCompanies()).thenReturn(2L);
        when(jobs.count()).thenReturn(4L);
        when(jobs.countByDeadlineGreaterThanEqual(any(LocalDate.class))).thenReturn(2L);
        when(jobs.countByDeadlineLessThan(any(LocalDate.class))).thenReturn(1L);
        when(applications.count()).thenReturn(8L);
        when(applications.countByStatusIgnoreCase("SHORTLISTED")).thenReturn(2L);
        when(applications.countGroupedByStatus()).thenReturn(List.<Object[]>of(new Object[]{"SHORTLISTED", 2L}, new Object[]{null, 6L}));
        when(students.countGroupedByBranch()).thenReturn(List.<Object[]>of(new Object[]{"Computer Science", 7L}, new Object[]{null, 5L}));

        Job job = new Job(); job.setId(5L); job.setTitle("Software Engineer"); job.setCompany("Example Co"); job.setCreatedAt(LocalDateTime.now().minusHours(1));
        when(jobs.findTop8ByCreatedAtIsNotNullOrderByCreatedAtDesc()).thenReturn(List.of(job));
        application app = new application(); app.setId(9L); app.setJobId(5L); app.setStatus("APPLIED"); app.setAppliedAt(LocalDateTime.now());
        when(applications.findTop8ByAppliedAtIsNotNullOrderByAppliedAtDesc()).thenReturn(List.of(app));

        AdminDashboardOverviewDto result = service.getOverview();

        assertEquals(12L, result.statistics().get("students"));
        assertEquals(2L, result.statistics().get("companies"));
        assertEquals(2L, result.statistics().get("activeJobs"));
        assertEquals(1L, result.statistics().get("closedJobs"));
        assertEquals(6L, result.applicationStatuses().get("APPLIED"));
        assertEquals(2L, result.applicationStatuses().get("SHORTLISTED"));
        assertEquals(0L, result.applicationStatuses().get("SELECTED"));
        assertEquals(5L, result.studentsByBranch().get("Not specified"));
        assertEquals(2, result.recentActivity().size());
        assertEquals("APPLICATION", result.recentActivity().get(0).type());
        assertFalse(result.placementDataAvailable());
        verify(jobs).countByDeadlineGreaterThanEqual(any(LocalDate.class));
    }

    @Test void returnsEmptyGroupsAndNoRecentEventsForEmptyPortal() {
        when(jobs.count()).thenReturn(0L);
        when(jobs.countByDeadlineGreaterThanEqual(any(LocalDate.class))).thenReturn(0L);
        when(jobs.countByDeadlineLessThan(any(LocalDate.class))).thenReturn(0L);
        when(applications.countGroupedByStatus()).thenReturn(List.of());
        when(students.countGroupedByBranch()).thenReturn(List.of());
        when(jobs.findTop8ByCreatedAtIsNotNullOrderByCreatedAtDesc()).thenReturn(List.of());
        when(applications.findTop8ByAppliedAtIsNotNullOrderByAppliedAtDesc()).thenReturn(List.of());

        AdminDashboardOverviewDto result = service.getOverview();

        assertEquals(0L, result.statistics().get("jobs"));
        assertEquals(0L, result.statistics().get("applications"));
        assertTrue(result.studentsByBranch().isEmpty());
        assertTrue(result.recentActivity().isEmpty());
    }
}
