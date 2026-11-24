package com.telusko.placement_portal.service;

import com.telusko.placement_portal.dto.InterviewScheduleRequest;
import com.telusko.placement_portal.entity.Job;
import com.telusko.placement_portal.entity.Student;
import com.telusko.placement_portal.entity.application;
import com.telusko.placement_portal.repository.ApplicationRepo;
import com.telusko.placement_portal.repository.JobRepo;
import com.telusko.placement_portal.repository.StudentRepo;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class InterviewScheduleServiceTest {
    private ApplicationRepo applications;
    private JobRepo jobs;
    private StudentRepo students;
    private ApplicationService applicationService;
    private EmailService emailService;
    private InterviewScheduleService service;
    private application applicant;

    @BeforeEach void setUp() {
        applications = mock(ApplicationRepo.class); jobs = mock(JobRepo.class); students = mock(StudentRepo.class);
        applicationService = mock(ApplicationService.class); emailService = mock(EmailService.class);
        service = new InterviewScheduleService(applications, jobs, students, applicationService, emailService);
        applicant = new application(); applicant.setId(50L); applicant.setJobId(70L); applicant.setStudentId(80L); applicant.setStatus("SHORTLISTED");
        Job job = new Job(); job.setId(70L); job.setTitle("Software Engineer"); job.setCompany("Campus Co");
        Student student = new Student(); student.setId(80L); student.setName("A Student"); student.setEmail("student@example.test"); student.setProfileVisible(true);
        when(applications.findById(50L)).thenReturn(Optional.of(applicant));
        when(jobs.findByIdAndRecruiterId(70L, 9L)).thenReturn(Optional.of(job));
        when(students.findById(80L)).thenReturn(Optional.of(student));
        when(applicationService.changeStage(eq(50L), eq(9L), any())).thenAnswer(invocation -> { applicant.setStatus("INTERVIEW_SCHEDULED"); return applicant; });
    }

    @Test void schedulesOnlyAfterOwnershipCheckAndEmailsTheApplicantTheProvidedLink() {
        application result = service.schedule(9L, 50L, new InterviewScheduleRequest("https://meet.example.test/room-12"));
        assertEquals("INTERVIEW_SCHEDULED", result.getStatus());
        verify(emailService).sendEmail(eq("student@example.test"), contains("Software Engineer"), contains("https://meet.example.test/room-12"));
        verify(applicationService).changeStage(eq(50L), eq(9L), any());
    }

    @Test void refusesInvalidUrlsAndDoesNotChangeStageOrSendMail() {
        assertThrows(ResponseStatusException.class, () -> service.schedule(9L, 50L, new InterviewScheduleRequest("javascript:alert(1)")));
        verify(applicationService, never()).changeStage(anyLong(), anyLong(), any());
        verifyNoInteractions(emailService);
    }

    @Test void refusesApplicationsForAnotherRecruiter() {
        assertThrows(ResponseStatusException.class, () -> service.schedule(10L, 50L, new InterviewScheduleRequest("https://meet.example.test/room")));
        verifyNoInteractions(emailService);
        verify(applicationService, never()).changeStage(anyLong(), anyLong(), any());
    }

    @Test void onlyShortlistedCandidatesCanBeScheduled() {
        applicant.setStatus("APPLIED");
        assertThrows(ResponseStatusException.class, () -> service.schedule(9L, 50L, new InterviewScheduleRequest("https://meet.example.test/room")));
        verifyNoInteractions(emailService);
        verify(applicationService, never()).changeStage(anyLong(), anyLong(), any());
    }
}
