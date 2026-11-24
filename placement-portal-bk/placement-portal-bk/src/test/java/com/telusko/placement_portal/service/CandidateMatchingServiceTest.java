package com.telusko.placement_portal.service;

import com.telusko.placement_portal.dto.CandidateMatchDto;
import com.telusko.placement_portal.entity.Job;
import com.telusko.placement_portal.entity.Student;
import com.telusko.placement_portal.entity.application;
import com.telusko.placement_portal.repository.ApplicationRepo;
import com.telusko.placement_portal.repository.JobRepo;
import com.telusko.placement_portal.repository.StudentRepo;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class CandidateMatchingServiceTest {
    private JobRepo jobs;
    private ApplicationRepo applications;
    private StudentRepo students;
    private CandidateMatchingService service;

    @BeforeEach void setUp() {
        jobs = mock(JobRepo.class); applications = mock(ApplicationRepo.class); students = mock(StudentRepo.class);
        service = new CandidateMatchingService(jobs, applications, students, new JobMatchService(jobs, students, applications));
    }

    @Test void ranksApplicantsByScoreAndKeepsEveryEligibleApplicant() {
        Job job = job(); when(jobs.findByIdAndRecruiterId(9L, 4L)).thenReturn(Optional.of(job));
        application partial = application(11L, 1L, 2);
        application full = application(12L, 2L, 1);
        when(applications.findByJobIdOrderByAppliedAtAscIdAsc(9L)).thenReturn(List.of(partial, full));
        when(students.findAllById(List.of(1L, 2L))).thenReturn(List.of(student(1L, "Java"), student(2L, "Java, React")));

        List<CandidateMatchDto> result = service.ranked(4L, 9L);

        assertEquals(List.of(12L, 11L), result.stream().map(CandidateMatchDto::applicationId).toList());
        assertEquals(100, result.get(0).matchScore());
        assertEquals(50, result.get(1).matchScore());
        assertEquals("ELIGIBLE", result.get(0).eligibilityStatus());
    }

    @Test void refusesJobsNotOwnedByAuthenticatedRecruiter() {
        when(jobs.findByIdAndRecruiterId(9L, 4L)).thenReturn(Optional.empty());
        assertThrows(ResponseStatusException.class, () -> service.ranked(4L, 9L));
        verify(applications, never()).findByJobIdOrderByAppliedAtAscIdAsc(anyLong());
    }

    @Test void detailRequiresApplicationToBelongToRequestedJob() {
        when(jobs.findByIdAndRecruiterId(9L, 4L)).thenReturn(Optional.of(job()));
        when(applications.findByIdAndJobId(55L, 9L)).thenReturn(Optional.empty());
        assertThrows(ResponseStatusException.class, () -> service.detail(4L, 9L, 55L));
        verify(students, never()).findById(anyLong());
    }

    private Job job() { Job job = new Job(); job.setId(9L); job.setRecruiterId(4L); job.setSkills("Java, React"); job.setEligibility("All branches"); return job; }
    private application application(Long id, Long studentId, int day) { application app = new application(); app.setId(id); app.setStudentId(studentId); app.setJobId(9L); app.setStatus("APPLIED"); app.setAppliedAt(LocalDateTime.of(2026, 1, day, 9, 0)); return app; }
    private Student student(Long id, String skills) { Student s = new Student(); s.setId(id); s.setName("Candidate " + id); s.setSkills(skills); s.setProfileVisible(true); return s; }
}
