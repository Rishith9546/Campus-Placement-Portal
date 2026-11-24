package com.telusko.placement_portal.service;

import com.telusko.placement_portal.entity.Job;
import com.telusko.placement_portal.repository.ApplicationRepo;
import com.telusko.placement_portal.repository.JobRepo;
import com.telusko.placement_portal.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AdminJobServiceTest {
    private JobRepo jobs;
    private AdminJobService service;
    private Job job;

    @BeforeEach void setUp() {
        jobs = mock(JobRepo.class);
        service = new AdminJobService(jobs, mock(UserRepository.class), mock(ApplicationRepo.class));
        job = new Job(); job.setId(9L); job.setApprovalStatus("PENDING"); job.setDeadline(LocalDate.now().plusDays(5));
        when(jobs.findById(9L)).thenReturn(Optional.of(job));
        when(jobs.save(any(Job.class))).thenAnswer(call -> call.getArgument(0));
    }

    @Test void approvesPendingPostingAndClearsOldRejection() {
        job.setRejectionReason("old review note");
        assertEquals("APPROVED", service.approve(9L));
        assertEquals("APPROVED", job.getApprovalStatus());
        assertNull(job.getRejectionReason());
    }

    @Test void rejectionRequiresAndPersistsReason() {
        ResponseStatusException missing = assertThrows(ResponseStatusException.class, () -> service.reject(9L, "  "));
        assertEquals(HttpStatus.BAD_REQUEST, missing.getStatusCode());
        assertEquals("REJECTED", service.reject(9L, "Add salary range"));
        assertEquals("Add salary range", job.getRejectionReason());
    }

    @Test void closeAndReopenPreserveApprovalAndCheckDeadline() {
        job.setApprovalStatus("APPROVED");
        service.close(9L); assertTrue(job.isClosed());
        service.reopen(9L); assertFalse(job.isClosed());
        job.setClosed(true); job.setDeadline(LocalDate.now().minusDays(1));
        ResponseStatusException expired = assertThrows(ResponseStatusException.class, () -> service.reopen(9L));
        assertEquals(HttpStatus.CONFLICT, expired.getStatusCode());
    }

    @Test void moderationFlagRequiresReasonAndBlocksReopening() {
        job.setApprovalStatus("APPROVED"); job.setClosed(true);
        assertThrows(ResponseStatusException.class, () -> service.flag(9L, ""));
        service.flag(9L, "Posting details need investigation");
        assertTrue(job.isModerationFlagged());
        assertThrows(ResponseStatusException.class, () -> service.reopen(9L));
        service.unflag(9L);
        assertFalse(job.isModerationFlagged());
    }

    @Test void onlyRejectedJobsCanReturnToReview() {
        assertThrows(ResponseStatusException.class, () -> service.returnToReview(9L));
        job.setApprovalStatus("REJECTED"); job.setRejectionReason("Please revise");
        assertEquals("PENDING", service.returnToReview(9L));
        assertEquals("Please revise", job.getRejectionReason());
    }
}
