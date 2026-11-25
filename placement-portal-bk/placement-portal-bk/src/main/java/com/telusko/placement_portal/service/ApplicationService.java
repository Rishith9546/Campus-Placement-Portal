package com.telusko.placement_portal.service;

import com.telusko.placement_portal.entity.Job;
import com.telusko.placement_portal.entity.Student;
import com.telusko.placement_portal.entity.application;
import com.telusko.placement_portal.entity.ApplicationStageHistory;
import com.telusko.placement_portal.entity.PipelineStage;
import com.telusko.placement_portal.dto.PipelineApplicantDto;
import com.telusko.placement_portal.dto.PipelineStageChangeRequest;
import com.telusko.placement_portal.dto.ApplicationStageHistoryDto;
import com.telusko.placement_portal.repository.ApplicationStageHistoryRepo;
import com.telusko.placement_portal.repository.ApplicationRepo;
import com.telusko.placement_portal.repository.JobRepo;
import com.telusko.placement_portal.repository.StudentRepo;
import com.telusko.placement_portal.repository.PortalSettingsRepo;
import com.telusko.placement_portal.entity.PortalSettings;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class ApplicationService {

    private final ApplicationRepo repo;
    private final JobRepo jobRepo;
    private final StudentRepo studentRepo;
    private final ApplicationStageHistoryRepo historyRepo;
    private final PortalSettingsRepo portalSettings;

    public ApplicationService(
            ApplicationRepo repo,
            JobRepo jobRepo,
            StudentRepo studentRepo,
            ApplicationStageHistoryRepo historyRepo) {

        this(repo, jobRepo, studentRepo, historyRepo, null);
    }

    @Autowired
    public ApplicationService(ApplicationRepo repo, JobRepo jobRepo, StudentRepo studentRepo,
                              ApplicationStageHistoryRepo historyRepo, PortalSettingsRepo portalSettings) {

        this.repo = repo;
        this.jobRepo = jobRepo;
        this.studentRepo = studentRepo;
        this.historyRepo = historyRepo;
        this.portalSettings = portalSettings;
    }

    // ================= APPLY =================

    public application save(application app) {

        if (portalSettings != null && portalSettings.findAll().stream().findFirst().map(PortalSettings::isApplicationsEnabled).orElse(true) == false) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Student applications are temporarily disabled by the placement office.");
        }

        Job job = jobRepo.findById(app.getJobId())
                .orElseThrow(() -> new RuntimeException("Job not found"));
        if (!job.acceptsApplications(java.time.LocalDate.now())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This job is not accepting applications.");
        }
        app.setRecruiterId(job.getRecruiterId());

        Optional<application> existing =
                repo.findByStudentIdAndJobId(
                        app.getStudentId(),
                        app.getJobId()
                );

        if (existing.isPresent()) {
            return existing.get();
        }

        // A student submission can never set a recruiter-controlled pipeline stage.
        app.setStatus(PipelineStage.APPLIED.name());

        return repo.save(app);
    }

    // ================= GET APPLICATION =================

    public Optional<application> getApplication(
            Long studentId,
            Long jobId
           ) {
        return repo.findByStudentIdAndJobId(
                studentId,
                jobId
                
        );

    }

    // ================= GET STATUS =================

    public String getStatus(Long id) {

        application app =
                repo.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Application not found"
                                ));

        return app.getStatus();
    }

    // ================= GET BY STUDENT ID =================

    public List<application> getByStudentId(Long studentId) {

        List<application> applications =
                repo.findByStudentId(studentId);

        for (application app : applications) {

            Job job =
                    jobRepo.findById(app.getJobId())
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Job not found"
                                    ));

            app.setJob(job);
        }

        return applications;
    }

    // ================= GET BY RECRUITER ID =================

    public List<application> getByRecruiterId(Long recruiterId) {

        System.out.println("================================");
        System.out.println("Recruiter ID: " + recruiterId);

        // Get all jobs posted by this recruiter
        List<Job> jobs =
                jobRepo.findByRecruiterId(recruiterId);

        System.out.println("Jobs found: " + jobs.size());

        // Store all applications
        List<application> applications =
                new ArrayList<>();

        // Loop through recruiter's jobs
        for (Job job : jobs) {

            System.out.println(
                    "Job ID: " + job.getId()
            );

            System.out.println(
                    "Job Title: " + job.getTitle()
            );

            // Get applications for this job
            List<application> jobApplications =
                    repo.findByJobId(job.getId());

            System.out.println(
                    "Applications found for Job ID "
                            + job.getId()
                            + ": "
                            + jobApplications.size()
            );

            // Get student details for each application
            List<application> visibleApplications = new ArrayList<>();
            for (application app : jobApplications) {

                System.out.println(
                        "Application ID: " + app.getId()
                );

                System.out.println(
                        "Student ID: " + app.getStudentId()
                );

                Student student =
                        studentRepo.findById(
                                        app.getStudentId()
                                )
                                .orElseThrow(() ->
                                        new RuntimeException(
                                                "Student not found"
                                        ));

                if (Boolean.FALSE.equals(student.getProfileVisible())) continue;

                // Attach student details
                app.setStudent(student);

                // Attach job details
                app.setJob(job);
                visibleApplications.add(app);
            }

            // Add applications to final list
            applications.addAll(visibleApplications);
        }

        System.out.println(
                "Total applications: "
                        + applications.size()
        );

        System.out.println("================================");

        return applications;
    }

    @Transactional
    public application shortlistApplication(Long id, Long recruiterId) {
        return changeStage(id, recruiterId, new PipelineStageChangeRequest("SHORTLISTED", false, null), true);
    }

    @Transactional
    public application rejectApplication(Long id, Long recruiterId) {
        return changeStage(id, recruiterId, new PipelineStageChangeRequest("REJECTED", false, null), true);
    }

    public List<PipelineApplicantDto> pipelineApplicants(Long recruiterId, Long jobId) {
        List<Job> ownedJobs = jobRepo.findByRecruiterId(recruiterId).stream()
                .filter(j -> jobId == null || jobId.equals(j.getId())).toList();
        if (jobId != null && ownedJobs.isEmpty()) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Job not found.");
        if (ownedJobs.isEmpty()) return List.of();
        var jobIds = ownedJobs.stream().map(Job::getId).toList();
        var jobsById = ownedJobs.stream().collect(java.util.stream.Collectors.toMap(Job::getId, j -> j));
        List<application> records = repo.findByJobIdInOrderByAppliedAtAscIdAsc(jobIds);
        var studentsById = studentRepo.findAllById(records.stream().map(application::getStudentId).filter(java.util.Objects::nonNull).distinct().toList())
                .stream().collect(java.util.stream.Collectors.toMap(Student::getId, s -> s));
        return records.stream().map(app -> {
            Student student = studentsById.get(app.getStudentId()); Job job = jobsById.get(app.getJobId());
            if (student == null || job == null || Boolean.FALSE.equals(student.getProfileVisible())) return null;
            return new PipelineApplicantDto(app.getId(), student.getId(), student.getName(), student.getEmail(), student.getPhone(),
                    student.getBranch(), student.getCgpa(), student.getSkills(), student.getResume(), job.getId(), job.getTitle(),
                    job.getCompany(), app.getAppliedAt(), PipelineStage.parse(app.getStatus()).name());
        }).filter(java.util.Objects::nonNull).toList();
    }

    @Transactional
    public application changeStage(Long applicationId, Long recruiterId, PipelineStageChangeRequest request) {
        return changeStage(applicationId, recruiterId, request, false);
    }

    private application changeStage(Long applicationId, Long recruiterId, PipelineStageChangeRequest request, boolean legacyShortcut) {
        PipelineStage target;
        try { target = PipelineStage.valueOf(request.stage().trim().toUpperCase(java.util.Locale.ROOT)); }
        catch (RuntimeException ex) { throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown recruitment stage."); }
        application app = repo.findById(applicationId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found."));
        Job job = app.getJobId() == null ? null : jobRepo.findByIdAndRecruiterId(app.getJobId(), recruiterId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found."));
        if (job == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found.");
        PipelineStage current = PipelineStage.parse(app.getStatus());
        if (current == target) return app;
        if (current.terminal()) {
            if (!request.reopen()) throw new ResponseStatusException(HttpStatus.CONFLICT, "This application is closed. Explicit reopening is required.");
            if (target.terminal()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reopen the candidate into an active stage.");
        } else if (request.reopen()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reopening is only valid for selected or rejected applications.");
        } else if (!legacyShortcut && !validTransition(current, target)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "That stage transition is not allowed.");
        }
        ApplicationStageHistory history = new ApplicationStageHistory();
        history.setApplicationId(app.getId()); history.setPreviousStage(current.name()); history.setNewStage(target.name());
        history.setChangedByRecruiterId(recruiterId); history.setNote(request.note()); historyRepo.save(history);
        app.setStatus(target.name());
        return repo.save(app);
    }

    private boolean validTransition(PipelineStage from, PipelineStage to) {
        if (to == PipelineStage.REJECTED) return true;
        if (to == PipelineStage.SELECTED) return from == PipelineStage.INTERVIEWED;
        if (from == PipelineStage.SELECTED || from == PipelineStage.REJECTED) return false;
        // Backward moves are allowed; forward moves follow the defined pipeline one stage at a time.
        return to.ordinal() < from.ordinal() || to.ordinal() == from.ordinal() + 1;
    }

    public List<ApplicationStageHistoryDto> stageHistory(Long applicationId, Long recruiterId) {
        application app = repo.findById(applicationId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found."));
        if (app.getJobId() == null || jobRepo.findByIdAndRecruiterId(app.getJobId(), recruiterId).isEmpty())
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found.");
        return historyRepo.findAllByApplicationIdOrderByChangedAtAscIdAsc(applicationId).stream()
                .map(h -> new ApplicationStageHistoryDto(h.getId(), h.getApplicationId(), h.getPreviousStage(), h.getNewStage(), h.getChangedByRecruiterId(), h.getChangedAt(), h.getNote())).toList();
    }

    public Path recruiterResumePath(Long applicationId, Long recruiterId) {
        application app = repo.findById(applicationId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found."));
        if (app.getJobId() == null || jobRepo.findByIdAndRecruiterId(app.getJobId(), recruiterId).isEmpty())
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found.");
        Student student = app.getStudentId() == null ? null : studentRepo.findById(app.getStudentId()).orElse(null);
        if (student == null || Boolean.FALSE.equals(student.getProfileVisible()) || student.getResume() == null || student.getResume().isBlank())
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Resume not found.");
        Path directory = Paths.get("uploads/resume/").toAbsolutePath().normalize();
        Path file = directory.resolve(student.getResume()).normalize();
        if (!file.startsWith(directory) || !Files.isRegularFile(file)) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Resume not found.");
        return file;
    }


    public long getApplicationCount(Long recruiterId) {
        return repo.countApplicationsByRecruiterId(recruiterId);
    }

    public long getShortlistedCount(Long id) {
        return repo.countShortlistedByRecruiterId(id);
    }

    public List<application> getShortlisted(Long id) {
       List<application> applications=repo.findShortlistedByRecruiterId(id);
       List<application> visibleApplications = new ArrayList<>();
       for (application app : applications) {
           Student student=studentRepo.findById(app.getStudentId()).orElseThrow();
           if (Boolean.FALSE.equals(student.getProfileVisible())) continue;
           app.setStudent(student);
           Job job =
                   jobRepo.findById(app.getJobId())
                           .orElse(null);

           app.setJob(job);
           visibleApplications.add(app);
       }
        return visibleApplications;
    }

    public List<application> searchShortlisted(
            Long jobId,
            String keyword) {

        // Find the job using job ID
        Job job = jobRepo.findById(jobId).orElse(null);

        // If job does not exist
        if (job == null) {
            return List.of();
        }

        // Get only shortlisted applications for this job
        List<application> applications =
                repo.findByJobIdAndStatus(
                        jobId,
                        "SHORTLISTED"
                );

        // Handle null keyword
        String search = keyword == null
                ? ""
                : keyword.toLowerCase().trim();

        return applications.stream()
                .filter(app -> {

                    // Get student
                    Student student = studentRepo.findById(
                            app.getStudentId()
                    ).orElse(null);

                    // If student doesn't exist
                    if (student == null) {
                        return false;
                    }

                    if (Boolean.FALSE.equals(student.getProfileVisible())) return false;

                    // Attach student and job
                    app.setStudent(student);
                    app.setJob(job);

                    // Student details
                    String name = student.getName() == null
                            ? ""
                            : student.getName().toLowerCase();

                    String email = student.getEmail() == null
                            ? ""
                            : student.getEmail().toLowerCase();

                    String skills = student.getSkills() == null
                            ? ""
                            : student.getSkills().toLowerCase();

                    String branch = student.getBranch() == null
                            ? ""
                            : student.getBranch().toLowerCase();

                    // Job details
                    String jobTitle = job.getTitle() == null
                            ? ""
                            : job.getTitle().toLowerCase();

                    String company = job.getCompany() == null
                            ? ""
                            : job.getCompany().toLowerCase();

                    // Search
                    return name.contains(search)
                            || email.contains(search)
                            || skills.contains(search)
                            || branch.contains(search)
                            || jobTitle.contains(search)
                            || company.contains(search);
                })
                .toList();
    }
    public long getJobsCountById(int id) {
        return repo.countByJobId(id);
    }
}
