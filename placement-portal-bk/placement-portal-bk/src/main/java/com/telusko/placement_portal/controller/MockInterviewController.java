
package com.telusko.placement_portal.controller;

import com.telusko.placement_portal.service.MockInterviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/mock-interview")
@CrossOrigin(origins = "http://localhost:5173")
public class MockInterviewController {

    private final MockInterviewService mockInterviewService;

    public MockInterviewController(MockInterviewService mockInterviewService) {
        this.mockInterviewService = mockInterviewService;
    }

    @PostMapping("/questions")
    public ResponseEntity<Map<String, Object>> generateQuestions(
            @RequestBody Map<String, Object> request) {

        String topic = (String) request.get("topic");
        String difficulty = (String) request.get("difficulty");
        int questionCount = ((Number) request.get("questionCount")).intValue();

        return ResponseEntity.ok(
                mockInterviewService.generateQuestions(
                        topic, difficulty, questionCount
                )
        );
    }

    @PostMapping("/submit")
    public ResponseEntity<Map<String, Object>> evaluateAnswers(
            @RequestBody Map<String, Object> request) {

        return ResponseEntity.ok(
                mockInterviewService.evaluateAnswers(request)
        );
    }
}
