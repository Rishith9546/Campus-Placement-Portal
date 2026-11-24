package com.telusko.placement_portal.service;

import com.telusko.placement_portal.dto.*;
import com.telusko.placement_portal.entity.*;
import com.telusko.placement_portal.entity.StudentProfileEntry.EntryType;
import com.telusko.placement_portal.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class CandidateComparisonService {
    private static final int MIN_CANDIDATES = 2;
    private static final int MAX_CANDIDATES = 5;
    private final JobRepo jobs;
    private final ApplicationRepo applications;
    private final StudentRepo students;
    private final StudentProfileEntryRepository profileEntries;
    private final JobMatchService matcher;

    public CandidateComparisonService(JobRepo jobs, ApplicationRepo applications, StudentRepo students,
            StudentProfileEntryRepository profileEntries, JobMatchService matcher) {
        this.jobs = jobs; this.applications = applications; this.students = students;
        this.profileEntries = profileEntries; this.matcher = matcher;
    }

    @Transactional(readOnly = true)
    public List<CandidateComparisonDto> compare(Long recruiterId, Long jobId, List<Long> applicationIds) {
        if (applicationIds == null || applicationIds.size() < MIN_CANDIDATES || applicationIds.size() > MAX_CANDIDATES)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Select between 2 and 5 applicants to compare.");
        LinkedHashSet<Long> uniqueIds = new LinkedHashSet<>(applicationIds);
        if (uniqueIds.size() != applicationIds.size() || uniqueIds.contains(null))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Applicant selections must be unique and valid.");
        Job job = jobs.findByIdAndRecruiterId(jobId, recruiterId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Job not found."));
        List<application> selected = applications.findForComparison(jobId, List.copyOf(uniqueIds));
        if (selected.size() != uniqueIds.size())
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "One or more applicants are not available for this job.");
        Map<Long, application> appsById = selected.stream().collect(Collectors.toMap(application::getId, a -> a));
        List<Long> studentIds = selected.stream().map(application::getStudentId).filter(Objects::nonNull).distinct().toList();
        Map<Long, Student> studentsById = students.findAllById(studentIds).stream().collect(Collectors.toMap(Student::getId, s -> s));
        if (studentsById.values().stream().anyMatch(s -> Boolean.FALSE.equals(s.getProfileVisible())))
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "One or more applicants are not available for comparison.");
        Map<Long, List<StudentProfileEntry>> entriesByStudent = studentIds.isEmpty() ? Map.of()
                : profileEntries.findComparisonEntries(studentIds, List.of(EntryType.PROJECT, EntryType.EXPERIENCE)).stream()
                        .collect(Collectors.groupingBy(entry -> entry.getStudent().getId()));
        return uniqueIds.stream().map(id -> {
                    application app = appsById.get(id);
                    Long studentId = app.getStudentId();
                    return toDto(job, app, studentsById.get(studentId), studentId == null ? List.of() : entriesByStudent.getOrDefault(studentId, List.of()));
                })
                .toList();
    }

    private CandidateComparisonDto toDto(Job job, application app, Student student, List<StudentProfileEntry> entries) {
        JobMatchDto score = matcher.evaluateCandidate(job, student, app.getStatus());
        List<ComparisonProfileEntryDto> projects = entries.stream().filter(e -> e.getType() == EntryType.PROJECT).map(this::entryDto).toList();
        List<ComparisonProfileEntryDto> experience = entries.stream().filter(e -> e.getType() == EntryType.EXPERIENCE).map(this::entryDto).toList();
        ComparisonMatchDto match = new ComparisonMatchDto(score.matchScore(), score.matchScoreAvailable(), score.eligibilityStatus(),
                score.skillMatchScore(), score.branchMatchScore(), score.cgpaMatchScore(),
                criterionStatus(score.branchMatchScore(), score.eligibilityReasons(), "branch"),
                criterionStatus(score.cgpaMatchScore(), score.eligibilityReasons(), "cgpa"), score.minimumCgpa(), score.eligibleBranches(), job.getEligibility(),
                score.requiredSkills(), score.matchedSkills(), score.missingSkills(), score.matchScoreAvailable()
                        ? "Deterministic Step 1 score: skills 60%, branch 20%, CGPA 20%, normalized over available job requirements."
                        : "A match score is unavailable because the job has no structured match criteria or candidate data.");
        return new CandidateComparisonDto(app.getId(), app.getStudentId(), student == null ? "Profile unavailable" : student.getName(),
                student != null, student == null ? null : student.getBranch(), student == null ? null : student.getCgpa(),
                student == null ? null : student.getSkills(), app.getAppliedAt(), PipelineStage.parse(app.getStatus()).name(),
                student != null && student.getResume() != null && !student.getResume().isBlank(), match, projects, experience);
    }

    private ComparisonProfileEntryDto entryDto(StudentProfileEntry entry) {
        return new ComparisonProfileEntryDto(entry.getTitle(), entry.getOrganization(), entry.getRole(), entry.getDescription(),
                entry.getTechnologies(), entry.getStartDate(), entry.getEndDate());
    }

    private String criterionStatus(Integer score, List<String> reasons, String criterion) {
        if (score != null) return score == 100 ? "MATCH" : "MISMATCH";
        return reasons.stream().anyMatch(reason -> reason.toLowerCase(Locale.ROOT).contains(criterion)) ? "NEEDS_REVIEW" : "NOT_REQUIRED";
    }
}
