package com.telusko.placement_portal.controller;

import com.telusko.placement_portal.entity.User;
import com.telusko.placement_portal.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/recruiter")
@CrossOrigin(origins = "http://localhost:5173")
public class RecruiterController {

    private final UserRepository userRepository;

    public RecruiterController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication authentication) {

        String email = authentication.getName();

        User recruiter = userRepository
                .findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Recruiter not found"));

        if (!"RECRUITER".equals(recruiter.getRole())) {
            return ResponseEntity
                    .status(403)
                    .body(Map.of("message", "Access denied"));
        }

        return ResponseEntity.ok(
                Map.of(
                        "name", recruiter.getName(),
                        "email", recruiter.getEmail(),
                        "companyName", recruiter.getCompanyName(),
                        "role", recruiter.getRole()
                )
        );
    }
}