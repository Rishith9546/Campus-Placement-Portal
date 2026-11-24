package com.telusko.placement_portal.controller;

import com.telusko.placement_portal.dto.*;
import com.telusko.placement_portal.security.UserPrincipal;
import com.telusko.placement_portal.service.ResumeAnalysisService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/resume-analyzer")
public class ResumeAnalyzerController {
    private final ResumeAnalysisService service;
    public ResumeAnalyzerController(ResumeAnalysisService service){this.service=service;}
    /** Backward-compatible multipart endpoint: the filename is checked against the authenticated student's profile. */
    @PostMapping("/analyze") public ResumeAnalysisViewDto analyze(@RequestParam(value="resume",required=false) String filename,
            @RequestParam(value="jobDescription",required=false) String jobDescription,
            @RequestParam(value="jobId",required=false) Long jobId,
            @RequestHeader(value="Idempotency-Key",required=false) String requestKey,
            @AuthenticationPrincipal UserPrincipal user){return service.analyze(user,filename,jobDescription,jobId,requestKey);}
    @GetMapping("/latest") public ResponseEntity<ResumeAnalysisViewDto> latest(@AuthenticationPrincipal UserPrincipal user){ResumeAnalysisViewDto result=service.latest(user);return result==null?ResponseEntity.noContent().build():ResponseEntity.ok(result);}
    @GetMapping("/history") public List<ResumeAnalysisViewDto> history(@AuthenticationPrincipal UserPrincipal user,@RequestParam(defaultValue="30") int limit){return service.history(user,limit);}
    @GetMapping("/history/{id}") public ResumeAnalysisViewDto get(@AuthenticationPrincipal UserPrincipal user,@PathVariable long id){return service.get(user,id);}
    @PostMapping("/compare") public Map<String,Object> compare(@AuthenticationPrincipal UserPrincipal user,@Valid @RequestBody ResumeCompareRequest request){return service.compare(user,request);}
    @GetMapping("/trend") public List<ResumeTrendPointDto> trend(@AuthenticationPrincipal UserPrincipal user){return service.trend(user);}
    @GetMapping("/options") public Map<String,Object> options(){return service.options();}
    @PostMapping("/improve") public Map<String,Object> improve(@AuthenticationPrincipal UserPrincipal user,@Valid @RequestBody ResumeImprovementRequest request){return service.improve(user,request);}
}
