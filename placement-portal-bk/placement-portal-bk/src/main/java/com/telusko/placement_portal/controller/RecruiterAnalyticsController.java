package com.telusko.placement_portal.controller;

import com.telusko.placement_portal.dto.RecruiterAnalyticsDto;
import com.telusko.placement_portal.security.UserPrincipal;
import com.telusko.placement_portal.service.RecruiterAnalyticsService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/recruiter/analytics")
public class RecruiterAnalyticsController {
    private final RecruiterAnalyticsService service;

    public RecruiterAnalyticsController(RecruiterAnalyticsService service) { this.service = service; }

    @GetMapping
    public RecruiterAnalyticsDto getAnalytics(@AuthenticationPrincipal UserPrincipal principal) {
        return service.getAnalytics(principal.getId());
    }
}
