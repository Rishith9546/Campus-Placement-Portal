package com.telusko.placement_portal.controller;

import com.telusko.placement_portal.dto.ApplicationStageHistoryDto;
import com.telusko.placement_portal.dto.PipelineApplicantDto;
import com.telusko.placement_portal.dto.PipelineStageChangeRequest;
import com.telusko.placement_portal.dto.InterviewScheduleRequest;
import com.telusko.placement_portal.entity.application;
import com.telusko.placement_portal.security.UserPrincipal;
import com.telusko.placement_portal.service.ApplicationService;
import com.telusko.placement_portal.service.CandidateMatchingService;
import com.telusko.placement_portal.service.InterviewScheduleService;
import com.telusko.placement_portal.dto.CandidateMatchDto;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import java.nio.file.Path;

import java.util.List;

@RestController
@RequestMapping("/api/recruiter/pipeline")
public class RecruiterPipelineController {
    private final ApplicationService service;
    private final CandidateMatchingService matchingService;
    private final InterviewScheduleService interviewScheduleService;
    public RecruiterPipelineController(ApplicationService service, CandidateMatchingService matchingService,
            InterviewScheduleService interviewScheduleService) {
        this.service = service; this.matchingService = matchingService; this.interviewScheduleService = interviewScheduleService;
    }

    @GetMapping("/matches")
    public List<CandidateMatchDto> matches(@AuthenticationPrincipal UserPrincipal principal) {
        return matchingService.allForRecruiter(principal.getId());
    }

    @GetMapping("/applicants")
    public List<PipelineApplicantDto> applicants(@AuthenticationPrincipal UserPrincipal principal,
                                                 @RequestParam(required = false) Long jobId) {
        return service.pipelineApplicants(principal.getId(), jobId);
    }

    @PutMapping("/applications/{applicationId}/stage")
    public application stage(@PathVariable Long applicationId, @Valid @RequestBody PipelineStageChangeRequest request,
                             @AuthenticationPrincipal UserPrincipal principal) {
        return service.changeStage(applicationId, principal.getId(), request);
    }

    @PostMapping("/applications/{applicationId}/schedule-interview")
    public application scheduleInterview(@PathVariable Long applicationId,
            @Valid @RequestBody InterviewScheduleRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return interviewScheduleService.schedule(principal.getId(), applicationId, request);
    }

    @GetMapping("/applications/{applicationId}/history")
    public List<ApplicationStageHistoryDto> history(@PathVariable Long applicationId,
                                                     @AuthenticationPrincipal UserPrincipal principal) {
        return service.stageHistory(applicationId, principal.getId());
    }

    @GetMapping("/applications/{applicationId}/resume")
    public ResponseEntity<Resource> resume(@PathVariable Long applicationId, @AuthenticationPrincipal UserPrincipal principal) {
        Path file = service.recruiterResumePath(applicationId, principal.getId());
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_PDF).body(new FileSystemResource(file));
    }
}
