package com.telusko.placement_portal.controller;

import com.telusko.placement_portal.dto.CandidateComparisonDto;
import com.telusko.placement_portal.dto.CandidateComparisonRequest;
import com.telusko.placement_portal.security.UserPrincipal;
import com.telusko.placement_portal.service.CandidateComparisonService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/recruiter/jobs/{jobId}/comparison")
public class CandidateComparisonController {
    private final CandidateComparisonService service;
    public CandidateComparisonController(CandidateComparisonService service) { this.service = service; }

    @PostMapping
    public List<CandidateComparisonDto> compare(@PathVariable Long jobId,
            @Valid @RequestBody CandidateComparisonRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return service.compare(principal.getId(), jobId, request.applicationIds());
    }
}
