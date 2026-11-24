package com.telusko.placement_portal.controller;

import com.telusko.placement_portal.dto.CandidateMatchDto;
import com.telusko.placement_portal.security.UserPrincipal;
import com.telusko.placement_portal.service.CandidateMatchingService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recruiter/jobs/{jobId}/candidate-matches")
public class CandidateMatchingController {
    private final CandidateMatchingService service;
    public CandidateMatchingController(CandidateMatchingService service) { this.service = service; }

    @GetMapping
    public List<CandidateMatchDto> ranked(@PathVariable Long jobId, @AuthenticationPrincipal UserPrincipal principal) {
        return service.ranked(principal.getId(), jobId);
    }

    @GetMapping("/{applicationId}")
    public CandidateMatchDto detail(@PathVariable Long jobId, @PathVariable Long applicationId,
                                    @AuthenticationPrincipal UserPrincipal principal) {
        return service.detail(principal.getId(), jobId, applicationId);
    }
}
