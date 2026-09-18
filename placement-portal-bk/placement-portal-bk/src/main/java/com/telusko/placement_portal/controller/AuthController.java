package com.telusko.placement_portal.controller;

import com.telusko.placement_portal.dto.RecruiterSignupRequest;
import com.telusko.placement_portal.dto.SigninRequest;
import com.telusko.placement_portal.dto.SignupRequest;
import com.telusko.placement_portal.entity.Student;
import com.telusko.placement_portal.entity.User;
import com.telusko.placement_portal.repository.StudentRepo;
import com.telusko.placement_portal.repository.UserRepository;
import com.telusko.placement_portal.security.JwtService;

import org.springframework.http.ResponseEntity;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final UserRepository userRepository;
    private final StudentRepo studentRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthController(
            UserRepository userRepository,
            StudentRepo studentRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService) {

        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    // ==============================
    // STUDENT SIGNUP
    // ==============================

    @PostMapping("/signup")
    public ResponseEntity<?> signup(
            @RequestBody SignupRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {

            return ResponseEntity
                    .badRequest()
                    .body(Map.of(
                            "message",
                            "Email already registered"
                    ));
        }

        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());

        user.setPassword(
                passwordEncoder.encode(request.getPassword())
        );

        user.setRole("STUDENT");

        // Save user first so ID is generated
        userRepository.save(user);

        // Create student profile with same ID
        Student student = new Student();

        student.setId(user.getId());
        student.setName(user.getName());
        student.setEmail(user.getEmail());

        student.setPhone("");
        student.setRollNo("");
        student.setBranch("");
        student.setCgpa(0.0);
        student.setSkills("");
        student.setProfilePhoto("");
        student.setResume("");

        studentRepository.save(student);

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Student registration successful"
                )
        );
    }

    // ==============================
    // LOGIN
    // ==============================

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody SigninRequest request) {

        Authentication authentication =
                authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                                request.getEmail(),
                                request.getPassword()
                        )
                );

        String token =
                jwtService.generateToken(
                        authentication.getName()
                );

        String role =
                authentication.getAuthorities()
                        .iterator()
                        .next()
                        .getAuthority();

        return ResponseEntity.ok(
                Map.of(
                        "message", "Login successful",
                        "token", token,
                        "role", role
                )
        );
    }

    // ==============================
    // RECRUITER SIGNUP
    // ==============================

    @PostMapping("/recruiter/signup")
    public ResponseEntity<?> recruiterSignup(
            @RequestBody RecruiterSignupRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {

            return ResponseEntity
                    .badRequest()
                    .body(Map.of(
                            "message",
                            "Email already registered"
                    ));
        }

        User user = new User();

        user.setName(request.getRecruiterName());

        user.setCompanyName(
                request.getCompanyName()
        );

        user.setEmail(
                request.getEmail()
        );

        user.setPassword(
                passwordEncoder.encode(
                        request.getPassword()
                )
        );

        user.setRole("RECRUITER");

        userRepository.save(user);

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Recruiter registration successful"
                )
        );
    }
}