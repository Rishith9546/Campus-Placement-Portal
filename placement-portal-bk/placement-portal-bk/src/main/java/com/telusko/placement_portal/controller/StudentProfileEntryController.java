package com.telusko.placement_portal.controller;

import com.telusko.placement_portal.dto.StudentProfileEntryRequest;
import com.telusko.placement_portal.dto.StudentProfileEntryResponse;
import com.telusko.placement_portal.security.UserPrincipal;
import com.telusko.placement_portal.service.StudentProfileEntryService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/student/profile/entries")
@CrossOrigin(origins = "http://localhost:5173")
public class StudentProfileEntryController {
    private final StudentProfileEntryService service;

    public StudentProfileEntryController(StudentProfileEntryService service) { this.service = service; }

    @GetMapping
    public List<StudentProfileEntryResponse> list(@AuthenticationPrincipal UserPrincipal user) {
        return service.list(user.getId());
    }

    @PostMapping
    public StudentProfileEntryResponse create(@Valid @RequestBody StudentProfileEntryRequest request, @AuthenticationPrincipal UserPrincipal user) {
        return service.create(user.getId(), request);
    }

    @PutMapping("/{id}")
    public StudentProfileEntryResponse update(@PathVariable Long id, @Valid @RequestBody StudentProfileEntryRequest request, @AuthenticationPrincipal UserPrincipal user) {
        return service.update(user.getId(), id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal user) {
        service.delete(user.getId(), id);
    }
}
