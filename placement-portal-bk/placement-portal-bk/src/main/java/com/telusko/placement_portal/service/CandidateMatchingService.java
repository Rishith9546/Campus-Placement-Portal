package com.telusko.placement_portal.service;

import com.telusko.placement_portal.dto.CandidateMatchDto;
import com.telusko.placement_portal.dto.JobMatchDto;
import com.telusko.placement_portal.entity.Job;
import com.telusko.placement_portal.entity.Student;
import com.telusko.placement_portal.entity.application;
import com.telusko.placement_portal.repository.ApplicationRepo;
import com.telusko.placement_portal.repository.JobRepo;
import com.telusko.placement_portal.repository.StudentRepo;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class CandidateMatchingService {
    private final JobRepo jobs;
    private final ApplicationRepo applications;
    private final StudentRepo students;
    private final JobMatchService scorer;

    public CandidateMatchingService(JobRepo jobs, ApplicationRepo applications, StudentRepo students, JobMatchService scorer) {
        this.jobs = jobs; this.applications = applications; this.students = students; this.scorer = scorer;
    }

    public List<CandidateMatchDto> ranked(Long recruiterId, Long jobId) {
        Job job = ownedJob(recruiterId, jobId);
        List<application> apps = applications.findByJobIdOrderByAppliedAtAscIdAsc(jobId);
        Map<Long, Student> byId = students.findAllById(apps.stream().map(application::getStudentId).filter(Objects::nonNull).distinct().toList())
                .stream().collect(Collectors.toMap(Student::getId, s -> s));
        return apps.stream().map(app -> result(job, app, byId.get(app.getStudentId())))
                .filter(Objects::nonNull)
                .sorted(Comparator.comparingInt(CandidateMatchDto::matchScore).reversed()
                        .thenComparing(CandidateMatchDto::appliedAt, Comparator.nullsLast(Comparator.naturalOrder()))
                        .thenComparing(CandidateMatchDto::applicationId))
                .toList();
    }

    /** Batch scoring for a recruiter board: one jobs query, one applications query, and one students query. */
    public List<CandidateMatchDto> allForRecruiter(Long recruiterId) {
        List<Job> recruiterJobs = jobs.findByRecruiterId(recruiterId);
        if (recruiterJobs.isEmpty()) return List.of();
        Map<Long, Job> jobsById = recruiterJobs.stream().collect(Collectors.toMap(Job::getId, j -> j));
        List<application> apps = applications.findByJobIdInOrderByAppliedAtAscIdAsc(recruiterJobs.stream().map(Job::getId).toList());
        Map<Long, Student> byId = students.findAllById(apps.stream().map(application::getStudentId).filter(Objects::nonNull).distinct().toList())
                .stream().collect(Collectors.toMap(Student::getId, s -> s));
        return apps.stream().filter(app -> jobsById.containsKey(app.getJobId()))
                .map(app -> result(jobsById.get(app.getJobId()), app, byId.get(app.getStudentId())))
                .filter(Objects::nonNull)
                .sorted(Comparator.comparing(CandidateMatchDto::jobId).thenComparing(CandidateMatchDto::matchScore, Comparator.reverseOrder())
                        .thenComparing(CandidateMatchDto::appliedAt, Comparator.nullsLast(Comparator.naturalOrder())))
                .toList();
    }

    public CandidateMatchDto detail(Long recruiterId, Long jobId, Long applicationId) {
        Job job = ownedJob(recruiterId, jobId);
        application app = applications.findByIdAndJobId(applicationId, jobId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found."));
        Student student = app.getStudentId() == null ? null : students.findById(app.getStudentId()).orElse(null);
        CandidateMatchDto dto = result(job, app, student);
        if (dto == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Candidate profile is unavailable to recruiters.");
        return dto;
    }

    private Job ownedJob(Long recruiterId, Long jobId) {
        return jobs.findByIdAndRecruiterId(jobId, recruiterId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Job not found."));
    }

    private CandidateMatchDto result(Job job, application app, Student student) {
        // Honor the existing student profile visibility setting used by the recruiter applicants page.
        if (student != null && Boolean.FALSE.equals(student.getProfileVisible())) return null;
        JobMatchDto match = scorer.evaluateCandidate(job, student, app.getStatus());
        List<String> strengths = new ArrayList<>();
        if (!match.matchedSkills().isEmpty()) strengths.add("Required skills matched: " + String.join(", ", match.matchedSkills()));
        if (match.branchMatchScore() != null && match.branchMatchScore() == 100) strengths.add("Branch meets the stated eligibility requirement.");
        if (match.cgpaMatchScore() != null && match.cgpaMatchScore() == 100) strengths.add("CGPA meets the stated minimum.");
        List<String> improve = new ArrayList<>();
        if (!match.missingSkills().isEmpty()) improve.add("Skills to strengthen: " + String.join(", ", match.missingSkills()));
        if (match.branchMatchScore() != null && match.branchMatchScore() == 0) improve.add("Current branch does not meet the stated requirement.");
        if (match.cgpaMatchScore() != null && match.cgpaMatchScore() == 0) improve.add("Current CGPA is below the stated minimum.");
        if (student == null) improve.add("Student profile data is unavailable; manual review is needed.");
        String explanation = match.matchScoreAvailable()
                ? "Score uses available job criteria: skills 60%, branch 20%, and CGPA 20%, normalized across criteria specified in this posting."
                : "A score cannot be calculated because the job has no structured matching requirements.";
        return new CandidateMatchDto(app.getId(), app.getStudentId(), student == null ? "Student profile unavailable" : student.getName(),
                job.getId(), match.matchScore(), match.matchScoreAvailable(), match.eligibilityStatus(),
                match.matchedSkills(), match.missingSkills(), status(match.branchMatchScore(), match.eligibilityReasons(), "branch"),
                status(match.cgpaMatchScore(), match.eligibilityReasons(), "cgpa"), match.skillMatchScore(),
                match.branchMatchScore(), match.cgpaMatchScore(), explanation, List.copyOf(strengths), List.copyOf(improve),
                match.eligibilityReasons(), app.getStatus(), app.getAppliedAt());
    }

    private String status(Integer score, List<String> reasons, String type) {
        if (score == null) return reasons.stream().anyMatch(r -> r.toLowerCase(Locale.ROOT).contains(type)) ? "NEEDS_REVIEW" : "NOT_REQUIRED";
        return score == 100 ? "MATCH" : "MISMATCH";
    }
}
