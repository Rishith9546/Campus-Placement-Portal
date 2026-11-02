package com.telusko.placement_portal.controller;


import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.telusko.placement_portal.dto.EmailRequest;
import com.telusko.placement_portal.service.EmailService;

@RestController 
@RequestMapping("/api/email")
@CrossOrigin (origins = "http://localhost:5173")
public class EmailController {
    private EmailService emailService;

    EmailController(EmailService emailService) {
        this.emailService = emailService;
    }
    
@PostMapping("/send")
public ResponseEntity<String> sendEmail(@RequestBody EmailRequest request) {

    emailService.sendEmail(
        request.getTo(),
        request.getSubject(),
        request.getBody()
    );

    return ResponseEntity.ok("Email sent successfully!");
}
   

}
