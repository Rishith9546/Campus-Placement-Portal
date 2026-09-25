package com.telusko.placement_portal.service;

import com.telusko.placement_portal.entity.Job;
import com.telusko.placement_portal.entity.Student;
import com.telusko.placement_portal.entity.application;
import com.telusko.placement_portal.repository.ApplicationRepo;
import com.telusko.placement_portal.repository.JobRepo;
import com.telusko.placement_portal.repository.StudentRepo;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ApplicationService {

    private final ApplicationRepo repo;
    private final JobRepo jobRepo;
    private final StudentRepo studentRepo;

    public ApplicationService(
            ApplicationRepo repo,
            JobRepo jobRepo,
            StudentRepo studentRepo) {

        this.repo = repo;
        this.jobRepo = jobRepo;
        this.studentRepo = studentRepo;
    }

    // ================= APPLY =================

    public application save(application app) {

        Optional<application> existing =
                repo.findByStudentIdAndJobId(
                        app.getStudentId(),
                        app.getJobId()
                );

        if (existing.isPresent()) {
            return existing.get();
        }

        return repo.save(app);
    }

    // ================= GET APPLICATION =================

    public application getApplication(
            Long studentId,
            Long jobId) {

        return repo.findByStudentIdAndJobId(
                        studentId,
                        jobId
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "Application not found"
                        ));
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

                // Attach student details
                app.setStudent(student);

                // Attach job details
                app.setJob(job);
            }

            // Add applications to final list
            applications.addAll(jobApplications);
        }

        System.out.println(
                "Total applications: "
                        + applications.size()
        );

        System.out.println("================================");

        return applications;
    }

    public application shortlistApplication(Long id) {

        application app = repo.findById(id).orElseThrow();

        app.setStatus("SHORTLISTED");

        return repo.save(app);
    }

    public application rejectApplication(Long id) {
        application application = repo.findById(id).orElseThrow();
        application.setStatus("REJECTED");
        return repo.save(application);
    }


    public long getApplicationCount(Long recruiterId) {
        return repo.countApplicationsByRecruiterId(recruiterId);
    }

    public long getShortlistedCount(Long id) {
        return repo.countShortlistedByRecruiterId(id);
    }

    public List<application> getShortlisted(Long id) {
       List<application> applications=repo.findShortlistedByRecruiterId(id);
       for (application app : applications) {
           Student student=studentRepo.findById(app.getStudentId()).orElseThrow();
           app.setStudent(student);
           Job job =
                   jobRepo.findById(app.getJobId())
                           .orElse(null);

           app.setJob(job);
       }
        return applications;
    }

    public List<application> searchShortlisted(String keyword) {

        List<application> applications =
                repo.findByStatus("SHORTLISTED");

        String search = keyword.toLowerCase().trim();

        return applications.stream()
                .filter(app -> {

                    Student student =
                            studentRepo.findById(
                                    app.getStudentId()
                            ).orElse(null);

                    Job job =
                            jobRepo.findById(
                                    app.getJobId()
                            ).orElse(null);

                    // If student or job doesn't exist,
                    // don't show this application
                    if (student == null || job == null) {
                        return false;
                    }

                    // Attach student and job
                    app.setStudent(student);
                    app.setJob(job);

                    String name =
                            student.getName() == null
                                    ? ""
                                    : student.getName().toLowerCase();

                    String email =
                            student.getEmail() == null
                                    ? ""
                                    : student.getEmail().toLowerCase();

                    String skills =
                            student.getSkills() == null
                                    ? ""
                                    : student.getSkills().toLowerCase();

                    String branch =
                            student.getBranch() == null
                                    ? ""
                                    : student.getBranch().toLowerCase();

                    String jobTitle =
                            job.getTitle() == null
                                    ? ""
                                    : job.getTitle().toLowerCase();

                    String company =
                            job.getCompany() == null
                                    ? ""
                                    : job.getCompany().toLowerCase();

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