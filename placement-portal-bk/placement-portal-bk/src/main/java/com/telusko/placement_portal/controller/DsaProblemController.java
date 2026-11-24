package com.telusko.placement_portal.controller;

import com.telusko.placement_portal.dto.DsaProblemRequest;
import com.telusko.placement_portal.dto.DsaProblemResponse;
import com.telusko.placement_portal.dto.DsaStatsResponse;
import com.telusko.placement_portal.security.UserPrincipal;
import com.telusko.placement_portal.service.DsaProblemService;
import com.telusko.placement_portal.service.StudentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/student/dsa")
@CrossOrigin(origins = "http://localhost:5173")
public class DsaProblemController {
    private final DsaProblemService dsaService;
    private final StudentService studentService;

    public DsaProblemController(DsaProblemService dsaService, StudentService studentService) {
        this.dsaService = dsaService;
        this.studentService = studentService;
    }

    @GetMapping("/problems")
    public List<DsaProblemResponse> list(@AuthenticationPrincipal UserPrincipal user) {
        return dsaService.list(studentId(user));
    }

    @PostMapping("/problems")
    @ResponseStatus(HttpStatus.CREATED)
    public DsaProblemResponse create(@Valid @RequestBody DsaProblemRequest request,
                                     @AuthenticationPrincipal UserPrincipal user) {
        Long studentId = studentService.getOrCreateProfile(requireStudent(user)).getId();
        return dsaService.create(studentId, request);
    }

    @GetMapping("/problems/{id}")
    public DsaProblemResponse get(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal user) {
        return dsaService.get(studentId(user), id);
    }

    @PutMapping("/problems/{id}")
    public DsaProblemResponse update(@PathVariable Long id, @Valid @RequestBody DsaProblemRequest request,
                                     @AuthenticationPrincipal UserPrincipal user) {
        return dsaService.update(studentId(user), id, request);
    }

    @DeleteMapping("/problems/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal user) {
        dsaService.delete(studentId(user), id);
    }

    @GetMapping("/stats")
    public DsaStatsResponse stats(@AuthenticationPrincipal UserPrincipal user) {
        return dsaService.stats(studentId(user));
    }

    private Long studentId(UserPrincipal user) { return requireStudent(user).getId(); }

    private UserPrincipal requireStudent(UserPrincipal user) {
        if (user == null || user.getAuthorities().stream().noneMatch(a -> "ROLE_STUDENT".equals(a.getAuthority()))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Student access is required.");
        }
        return user;
    }
}
