
package com.telusko.placement_portal.controller;

import com.telusko.placement_portal.service.ResumeAnalyzerService;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;

@RestController
@RequestMapping("/api/resume-analyzer")
public class ResumeAnalyzerController {

    private final ResumeAnalyzerService resumeAnalyzerService;

    public ResumeAnalyzerController(
            ResumeAnalyzerService resumeAnalyzerService) {
        this.resumeAnalyzerService = resumeAnalyzerService;
    }

    @PostMapping("/analyze")
    public Map<String, String> analyzeResume(
            @RequestParam("resume") String resumeFilename,
            @RequestParam("jobDescription") String jobDescription,
            Authentication authentication) throws IOException {

        System.out.println("=== RESUME ANALYZER STARTED ===");

        // Check authentication
        if (authentication == null
                || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Please log in first."
            );
        }

        // Validate resume filename
        if (resumeFilename == null
                || !resumeFilename.matches("[a-zA-Z0-9._-]+")
                || !resumeFilename.toLowerCase().endsWith(".pdf")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid resume filename."
            );
        }

        System.out.println("Resume filename: " + resumeFilename);

        // Validate job description
        if (jobDescription == null || jobDescription.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Job description is required."
            );
        }

        // Locate the resume using the same directory as StudentController
Path uploadDirectory = Path.of(
        "..", "..", "uploads", "resume"
).toAbsolutePath().normalize();

        Path resumePath = uploadDirectory
                .resolve(resumeFilename)
                .normalize();

        System.out.println("Resume path: " + resumePath);
        System.out.println(
                "Resume exists: " + Files.isRegularFile(resumePath)
        );

        // Prevent path traversal
        if (!resumePath.startsWith(uploadDirectory)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid resume path."
            );
        }

        // Check whether the file exists
        if (!Files.isRegularFile(resumePath)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Resume PDF not found at: " + resumePath
            );
        }

        try {
            // Read the PDF
            byte[] pdfBytes = Files.readAllBytes(resumePath);

            if (pdfBytes.length == 0) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "The resume PDF is empty."
                );
            }

            System.out.println("PDF loaded. Bytes: " + pdfBytes.length);
            System.out.println("Starting resume analysis...");

            // Analyze the resume using the service
            String analysis = resumeAnalyzerService.analyzeResume(
                    pdfBytes,
                    jobDescription
            );

            System.out.println("Resume analysis completed.");

            return Map.of("analysis", analysis);

        } catch (ResponseStatusException e) {
            throw e;
        } catch (IOException e) {
            e.printStackTrace();

            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Could not read the resume PDF.",
                    e
            );
        } catch (Exception e) {
            e.printStackTrace();

            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Resume analysis failed. Check the backend logs and Ollama service.",
                    e
            );
        }
    }
}
