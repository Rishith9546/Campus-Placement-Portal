package com.telusko.placement_portal.controller;

import com.telusko.placement_portal.dto.*;
import com.telusko.placement_portal.security.UserPrincipal;
import com.telusko.placement_portal.service.AdminStudentService;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/students")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminStudentController {
    private final AdminStudentService students;

    public AdminStudentController(AdminStudentService students) { this.students = students; }

    @GetMapping
    public AdminStudentPageDto list(@RequestParam(defaultValue = "0") int page,
                                    @RequestParam(defaultValue = "10") int size,
                                    @RequestParam(required = false) String search,
                                    @RequestParam(required = false) String branch,
                                    @RequestParam(required = false) Double minCgpa,
                                    @RequestParam(required = false) Double maxCgpa,
                                    @RequestParam(required = false) String skill,
                                    @RequestParam(required = false) String accountStatus,
                                    @RequestParam(defaultValue = "name") String sortBy,
                                    @RequestParam(defaultValue = "asc") String sortDirection) {
        return students.list(page, size, search, branch, minCgpa, maxCgpa, skill, accountStatus, sortBy, sortDirection);
    }

    @GetMapping("/branches")
    public List<String> branches() { return students.branches(); }

    @GetMapping("/{id}")
    public AdminStudentProfileDto profile(@PathVariable Long id) { return students.profile(id); }

    @GetMapping("/{id}/applications")
    public List<AdminStudentApplicationDto> applications(@PathVariable Long id) { return students.applications(id); }

    @GetMapping("/{id}/resume")
    public ResponseEntity<Resource> resume(@PathVariable Long id) {
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"student-resume.pdf\"")
                .body(students.resume(id));
    }

    @PatchMapping("/{id}/status")
    public Map<String, Object> status(@PathVariable Long id, @Valid @RequestBody AdminStudentStatusRequest request,
                                      @AuthenticationPrincipal UserPrincipal admin) {
        boolean enabled = students.setEnabled(id, request.enabled(), admin);
        return Map.of("id", id, "enabled", enabled, "message", enabled ? "Student account activated." : "Student account deactivated.");
    }
}
