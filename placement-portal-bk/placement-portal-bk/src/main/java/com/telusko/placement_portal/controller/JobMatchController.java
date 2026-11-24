package com.telusko.placement_portal.controller;

import com.telusko.placement_portal.dto.JobMatchDto;
import com.telusko.placement_portal.dto.JobMatchSummaryDto;
import com.telusko.placement_portal.security.UserPrincipal;
import com.telusko.placement_portal.service.JobMatchService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/student/job-matches")
public class JobMatchController {
    private final JobMatchService service;
    public JobMatchController(JobMatchService service){this.service=service;}
    @GetMapping("/summary") public JobMatchSummaryDto summary(@AuthenticationPrincipal UserPrincipal principal){return service.summary(principal);}
    @GetMapping("/jobs") public List<JobMatchDto> jobs(@AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue="ALL") String filter,@RequestParam(required=false) String search){return service.summary(principal,filter,search).matches();}
    @GetMapping("/eligible") public List<JobMatchDto> eligible(@AuthenticationPrincipal UserPrincipal principal){return service.summary(principal,"ELIGIBLE",null).matches();}
    @GetMapping("/high-match") public List<JobMatchDto> highMatch(@AuthenticationPrincipal UserPrincipal principal){return service.summary(principal,"HIGH_MATCH",null).matches();}
    @GetMapping("/skill-gaps") public List<JobMatchDto> skillGaps(@AuthenticationPrincipal UserPrincipal principal){return service.summary(principal,"MISSING_SKILLS",null).matches();}
    @GetMapping("/{jobId}") public JobMatchDto details(@AuthenticationPrincipal UserPrincipal principal,@PathVariable long jobId){return service.details(principal,jobId);}
}
