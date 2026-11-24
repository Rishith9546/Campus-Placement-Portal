package com.telusko.placement_portal.controller;

import com.telusko.placement_portal.dto.AdminDashboardOverviewDto;
import com.telusko.placement_portal.security.UserPrincipal;
import com.telusko.placement_portal.service.AdminDashboardService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {
    private final AdminDashboardService dashboard;

    public AdminController(AdminDashboardService dashboard) {
        this.dashboard = dashboard;
    }

    @GetMapping("/overview")
    public AdminDashboardOverviewDto overview() {
        return dashboard.getOverview();
    }

    @GetMapping("/dashboard/overview")
    public AdminDashboardOverviewDto dashboardOverview() {
        return dashboard.getOverview();
    }

    @GetMapping("/session")
    public Map<String, String> session(@AuthenticationPrincipal UserPrincipal principal) {
        return Map.of(
                "name", principal.getName(),
                "email", principal.getEmail(),
                "role", "ROLE_ADMIN"
        );
    }
}
