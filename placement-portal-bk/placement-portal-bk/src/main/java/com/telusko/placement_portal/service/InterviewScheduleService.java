package com.telusko.placement_portal.service;

import com.telusko.placement_portal.dto.InterviewScheduleRequest;
import com.telusko.placement_portal.dto.PipelineStageChangeRequest;
import com.telusko.placement_portal.entity.Job;
import com.telusko.placement_portal.entity.PipelineStage;
import com.telusko.placement_portal.entity.Student;
import com.telusko.placement_portal.entity.application;
import com.telusko.placement_portal.repository.ApplicationRepo;
import com.telusko.placement_portal.repository.JobRepo;
import com.telusko.placement_portal.repository.StudentRepo;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.util.Locale;

@Service
public class InterviewScheduleService {
    private final ApplicationRepo applications;
    private final JobRepo jobs;
    private final StudentRepo students;
    private final ApplicationService applicationService;
    private final EmailService emailService;

    public InterviewScheduleService(ApplicationRepo applications, JobRepo jobs, StudentRepo students,
            ApplicationService applicationService, EmailService emailService) {
        this.applications = applications;
        this.jobs = jobs;
        this.students = students;
        this.applicationService = applicationService;
        this.emailService = emailService;
    }

    @Transactional
    public application schedule(Long recruiterId, Long applicationId, InterviewScheduleRequest request) {
        String link = validateLink(request.interviewLink());
        application candidate = applications.findById(applicationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found."));
        Job job = candidate.getJobId() == null ? null : jobs.findByIdAndRecruiterId(candidate.getJobId(), recruiterId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found."));
        if (job == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found.");
        if (PipelineStage.parse(candidate.getStatus()) != PipelineStage.SHORTLISTED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Only shortlisted candidates can be scheduled for interview.");
        }

        Student student = candidate.getStudentId() == null ? null : students.findById(candidate.getStudentId()).orElse(null);
        if (student == null || Boolean.FALSE.equals(student.getProfileVisible()))
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Applicant not found.");
        if (student.getEmail() == null || student.getEmail().isBlank())
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Applicant has no email address on their profile.");

        application updated = applicationService.changeStage(applicationId, recruiterId,
                new PipelineStageChangeRequest(PipelineStage.INTERVIEW_SCHEDULED.name(), false,
                        "Interview meeting link emailed to applicant."));
        String subject = "Interview invitation: " + safe(job.getTitle(), "your application");
        String body = "Dear " + safe(student.getName(), "applicant") + ",\n\n"
                + "You are invited to an interview for " + safe(job.getTitle(), "the role")
                + (job.getCompany() == null || job.getCompany().isBlank() ? "" : " at " + safe(job.getCompany(), ""))
                + ".\n\nJoin the interview using this meeting link:\n" + link
                + "\n\nPlease contact the recruiter if you need to arrange a different time.\n\nBest wishes,\nRecruitment Team";
        emailService.sendEmail(student.getEmail(), subject, body);
        return updated;
    }

    private String validateLink(String raw) {
        if (raw == null || raw.isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "An interview meeting link is required.");
        try {
            URI uri = URI.create(raw.trim());
            String scheme = uri.getScheme() == null ? "" : uri.getScheme().toLowerCase(Locale.ROOT);
            if (!(scheme.equals("https") || scheme.equals("http")) || uri.getHost() == null || uri.getUserInfo() != null)
                throw new IllegalArgumentException("Invalid meeting URL");
            return uri.toASCIIString();
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Enter a valid http or https interview meeting link.");
        }
    }

    private String safe(String value, String fallback) {
        if (value == null || value.isBlank()) return fallback;
        return value.replaceAll("[\\r\\n]+", " ").trim();
    }
}
