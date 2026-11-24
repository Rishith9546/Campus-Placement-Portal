package com.telusko.placement_portal.service;

import com.telusko.placement_portal.dto.PipelineStageChangeRequest;
import com.telusko.placement_portal.entity.ApplicationStageHistory;
import com.telusko.placement_portal.entity.Job;
import com.telusko.placement_portal.entity.PipelineStage;
import com.telusko.placement_portal.entity.application;
import com.telusko.placement_portal.repository.ApplicationRepo;
import com.telusko.placement_portal.repository.ApplicationStageHistoryRepo;
import com.telusko.placement_portal.repository.JobRepo;
import com.telusko.placement_portal.repository.StudentRepo;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ApplicationPipelineServiceTest {
    private ApplicationRepo applications;
    private JobRepo jobs;
    private ApplicationStageHistoryRepo history;
    private ApplicationService service;
    private application app;

    @BeforeEach void setUp() {
        applications = mock(ApplicationRepo.class); jobs = mock(JobRepo.class); StudentRepo students = mock(StudentRepo.class);
        history = mock(ApplicationStageHistoryRepo.class);
        service = new ApplicationService(applications, jobs, students, history);
        app = new application(); app.setId(20L); app.setJobId(30L); app.setStudentId(40L); app.setStatus("APPLIED");
        Job job = new Job(); job.setId(30L); job.setRecruiterId(7L); job.setApprovalStatus("APPROVED");
        when(applications.findById(20L)).thenReturn(Optional.of(app));
        when(jobs.findByIdAndRecruiterId(30L, 7L)).thenReturn(Optional.of(job));
        when(applications.save(any(application.class))).thenAnswer(call -> call.getArgument(0));
        when(history.save(any(ApplicationStageHistory.class))).thenAnswer(call -> call.getArgument(0));
    }

    @Test void followsForwardPipelineAndRecordsEveryChange() {
        for (String stage : new String[]{"UNDER_REVIEW", "SHORTLISTED", "INTERVIEW_SCHEDULED", "INTERVIEWED", "SELECTED"}) {
            service.changeStage(20L, 7L, request(stage, false));
        }
        assertEquals("SELECTED", app.getStatus());
        verify(history, times(5)).save(any(ApplicationStageHistory.class));
    }

    @Test void rejectsSkippedForwardStagesButAllowsBackwardMovement() {
        ResponseStatusException invalid = assertThrows(ResponseStatusException.class,
                () -> service.changeStage(20L, 7L, request("INTERVIEWED", false)));
        assertEquals(HttpStatus.CONFLICT, invalid.getStatusCode());
        app.setStatus("SHORTLISTED");
        assertEquals("UNDER_REVIEW", service.changeStage(20L, 7L, request("UNDER_REVIEW", false)).getStatus());
    }

    @Test void rejectedAndSelectedStagesRequireExplicitReopening() {
        app.setStatus("REJECTED");
        ResponseStatusException closed = assertThrows(ResponseStatusException.class,
                () -> service.changeStage(20L, 7L, request("APPLIED", false)));
        assertEquals(HttpStatus.CONFLICT, closed.getStatusCode());
        assertEquals("UNDER_REVIEW", service.changeStage(20L, 7L, request("UNDER_REVIEW", true)).getStatus());
        app.setStatus("SELECTED");
        assertEquals("APPLIED", service.changeStage(20L, 7L, request("APPLIED", true)).getStatus());
    }

    @Test void preventsInvalidValuesAndForeignRecruiterChanges() {
        ResponseStatusException bad = assertThrows(ResponseStatusException.class,
                () -> service.changeStage(20L, 7L, request("PENDING", false)));
        assertEquals(HttpStatus.BAD_REQUEST, bad.getStatusCode());
        when(jobs.findByIdAndRecruiterId(30L, 9L)).thenReturn(Optional.empty());
        assertThrows(ResponseStatusException.class, () -> service.changeStage(20L, 9L, request("UNDER_REVIEW", false)));
        verify(applications, never()).save(any(application.class));
    }

    @Test void legacyShortlistAndRejectActionsUseTheUnifiedStageAndHistory() {
        assertEquals("SHORTLISTED", service.shortlistApplication(20L, 7L).getStatus());
        assertEquals("REJECTED", service.rejectApplication(20L, 7L).getStatus());
        verify(history, times(2)).save(any(ApplicationStageHistory.class));
    }

    @Test void recruiterCanScheduleAndCompleteInterviewThenRejectFromInterviewedStage() {
        assertEquals("UNDER_REVIEW", service.changeStage(20L, 7L, request("UNDER_REVIEW", false)).getStatus());
        assertEquals("SHORTLISTED", service.changeStage(20L, 7L, request("SHORTLISTED", false)).getStatus());
        assertEquals("INTERVIEW_SCHEDULED", service.changeStage(20L, 7L, request("INTERVIEW_SCHEDULED", false)).getStatus());
        assertEquals("INTERVIEWED", service.changeStage(20L, 7L, request("INTERVIEWED", false)).getStatus());
        assertEquals("REJECTED", service.changeStage(20L, 7L, request("REJECTED", false)).getStatus());
        verify(history, times(5)).save(any(ApplicationStageHistory.class));
    }

    @Test void oldAndBlankStatusesMapToAppliedForDisplay() {
        assertEquals(PipelineStage.APPLIED, PipelineStage.parse("pending"));
        assertEquals(PipelineStage.APPLIED, PipelineStage.parse(null));
    }

    @Test void newStudentApplicationCannotSetItsOwnPipelineStage() {
        Job job = new Job(); job.setId(30L); job.setRecruiterId(7L); job.setApprovalStatus("APPROVED");
        when(jobs.findById(30L)).thenReturn(Optional.of(job));
        when(applications.findByStudentIdAndJobId(40L, 30L)).thenReturn(Optional.empty());
        application submitted = new application(); submitted.setStudentId(40L); submitted.setJobId(30L); submitted.setStatus("SELECTED");
        when(applications.save(any(application.class))).thenAnswer(call -> call.getArgument(0));
        assertEquals("APPLIED", service.save(submitted).getStatus());
    }

    @Test void applicationsAreBlockedForUnapprovedClosedExpiredOrFlaggedJobs() {
        for (int state = 0; state < 4; state++) {
            Job job = new Job(); job.setId(30L);
            job.setApprovalStatus(state == 0 ? "PENDING" : "APPROVED");
            job.setClosed(state == 1);
            job.setDeadline(state == 2 ? java.time.LocalDate.now().minusDays(1) : java.time.LocalDate.now().plusDays(1));
            job.setModerationFlagged(state == 3);
            when(jobs.findById(30L)).thenReturn(Optional.of(job));
            application submitted = new application(); submitted.setStudentId(40L); submitted.setJobId(30L);
            ResponseStatusException blocked = assertThrows(ResponseStatusException.class, () -> service.save(submitted));
            assertEquals(HttpStatus.CONFLICT, blocked.getStatusCode());
            reset(jobs);
        }
    }

    @Test void emptyPipelineReturnsNoCandidates() {
        when(jobs.findByRecruiterId(7L)).thenReturn(java.util.List.of());
        assertTrue(service.pipelineApplicants(7L, null).isEmpty());
        verify(applications, never()).findByJobIdInOrderByAppliedAtAscIdAsc(any());
    }

    @Test void oldApplicationsHaveNoFabricatedHistory() {
        when(applications.findById(20L)).thenReturn(Optional.of(app));
        when(history.findAllByApplicationIdOrderByChangedAtAscIdAsc(20L)).thenReturn(java.util.List.of());
        assertTrue(service.stageHistory(20L, 7L).isEmpty());
    }

    private PipelineStageChangeRequest request(String stage, boolean reopen) { return new PipelineStageChangeRequest(stage, reopen, "test note"); }
}
