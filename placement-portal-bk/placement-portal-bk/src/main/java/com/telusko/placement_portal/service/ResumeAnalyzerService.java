
package com.telusko.placement_portal.service;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Service
public class ResumeAnalyzerService {

    private final RestClient restClient;

    public ResumeAnalyzerService() {
        this.restClient = RestClient.builder()
                .baseUrl("http://localhost:11434")
                .build();
    }

    public String analyzeResume(
            byte[] pdfBytes,
            String jobDescription
    ) throws IOException {

        // Validate PDF
        if (pdfBytes == null || pdfBytes.length == 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Resume PDF is empty."
            );
        }

        if (jobDescription == null || jobDescription.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Job description is required."
            );
        }

        // Extract text from PDF
        String resumeText;

        try (PDDocument document = Loader.loadPDF(pdfBytes)) {
            PDFTextStripper stripper = new PDFTextStripper();
            resumeText = stripper.getText(document);
        }

        if (resumeText == null || resumeText.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "No readable text found in the resume PDF."
            );
        }

        // Build the AI prompt
        String prompt = """
                You are an expert resume analyzer and technical recruiter.

                Analyze the candidate's resume against the given job description.

                RESUME:
                %s

                JOB DESCRIPTION:
                %s

                Provide the analysis using these sections:

                1. Resume Summary
                2. Education
                3. Technical Skills
                4. Projects and Experience
                5. Relevant Skills for This Job
                6. Missing or Weak Skills
                7. Strengths
                8. Areas to Improve
                9. ATS Optimization Suggestions
                10. Overall Job Match Score out of 100

                Give practical, honest feedback.
                Do not invent qualifications or experience that are not
                present in the resume.
                Explain the match score briefly.
                """.formatted(resumeText, jobDescription);

        // Prepare Ollama request
        Map<String, Object> request = new HashMap<>();
        request.put("model", "llama3.2:3b");
        request.put("prompt", prompt);
        request.put("stream", false);

        // Call Ollama
        try {
            Map<?, ?> response = restClient.post()
                    .uri("/api/generate")
                    .body(request)
                    .retrieve()
                    .body(Map.class);

            if (response == null || response.get("response") == null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "Ollama returned an empty response."
                );
            }

            return response.get("response").toString();

        } catch (ResponseStatusException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Failed to analyze the resume. Check that Ollama is running "
                            + "and the llama3.2:3b model is available.",
                    exception
            );
        }
    }
}
