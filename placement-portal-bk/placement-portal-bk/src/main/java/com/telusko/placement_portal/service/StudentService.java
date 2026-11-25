package com.telusko.placement_portal.service;

import com.telusko.placement_portal.entity.Job;
import org.springframework.stereotype.Service;

import com.telusko.placement_portal.entity.Student;
import com.telusko.placement_portal.repository.StudentRepo;
import com.telusko.placement_portal.security.UserPrincipal;
import com.telusko.placement_portal.dto.StudentAcademicRequest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.net.URI;

@Service
public class StudentService {

    private final StudentRepo studentRepository;

    public StudentService(StudentRepo studentRepository) {
        this.studentRepository = studentRepository;
    }


    // =================================================
    // CREATE / UPDATE PROFILE
    // =================================================

    public Student createProfile(
            Student student,
            UserPrincipal user) {

        Long userId = user.getId();

        Student existingStudent =
                studentRepository
                        .findById(userId)
                        .orElse(null);


        if (existingStudent == null) {

            existingStudent = new Student();

            existingStudent.setId(userId);
            existingStudent.setProfileVisible(true);
        }

        validateUrl(student.getGithubProfile());
        validateUrl(student.getLinkedInProfile());
        validateUrl(student.getPortfolioUrl());


        // User table information

        existingStudent.setName(
                user.getName()
        );

        existingStudent.setEmail(
                user.getEmail()
        );


        // Student profile information

        existingStudent.setRollNo(
                student.getRollNo()
        );

        existingStudent.setPhone(
                student.getPhone()
        );

        existingStudent.setBranch(
                student.getBranch()
        );

        existingStudent.setCgpa(
                student.getCgpa()
        );

        existingStudent.setSkills(
                student.getSkills()
        );

        if (student.getCollegeName() != null) existingStudent.setCollegeName(student.getCollegeName());
        if (student.getDegree() != null) existingStudent.setDegree(student.getDegree());
        if (student.getGraduationYear() != null) existingStudent.setGraduationYear(student.getGraduationYear());
        if (student.getBacklogs() != null) existingStudent.setBacklogs(student.getBacklogs());
        if (student.getGithubProfile() != null) existingStudent.setGithubProfile(student.getGithubProfile());
        if (student.getLinkedInProfile() != null) existingStudent.setLinkedInProfile(student.getLinkedInProfile());
        if (student.getPortfolioUrl() != null) existingStudent.setPortfolioUrl(student.getPortfolioUrl());
        if (student.getProfileVisible() != null) existingStudent.setProfileVisible(student.getProfileVisible());


        // IMPORTANT:
        // Do NOT set profilePhoto here.
        // Do NOT set resume here.
        //
        // This preserves existing uploaded files.


        return studentRepository.save(
                existingStudent
        );
    }

    @Transactional
    public Student updateAcademicProfile(StudentAcademicRequest request, UserPrincipal user) {
        Student student = studentRepository.findById(user.getId()).orElseGet(() -> {
            Student profile = new Student();
            profile.setId(user.getId());
            profile.setName(user.getName());
            profile.setEmail(user.getEmail());
            profile.setProfileVisible(true);
            return profile;
        });
        student.setCollegeName(request.collegeName().trim());
        student.setRollNo(request.rollNo().trim());
        student.setBranch(request.branch().trim());
        student.setDegree(request.degree().trim());
        student.setGraduationYear(request.graduationYear());
        student.setCgpa(request.cgpa());
        student.setBacklogs(request.backlogs() == null ? 0 : request.backlogs());
        return studentRepository.save(student);
    }


    // =================================================
    // GET PROFILE
    // =================================================

    public Student getProfile(Long userId) {

        return studentRepository
                .findById(userId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Student profile not found"
                        )
                );
    }

    public Student getOrCreateProfile(UserPrincipal user) {
        return studentRepository.findById(user.getId()).orElseGet(() -> {
            Student profile = new Student();
            profile.setId(user.getId());
            profile.setName(user.getName());
            profile.setEmail(user.getEmail());
            profile.setProfileVisible(true);
            return studentRepository.save(profile);
        });
    }


    // =================================================
    // SAVE STUDENT
    // =================================================

    public Student saveStudent(Student student) {

        return studentRepository.save(student);
    }

    private void validateUrl(String value) {
        if (value == null || value.isBlank()) return;
        try {
            URI uri = URI.create(value.trim());
            if (!uri.isAbsolute() || !("https".equalsIgnoreCase(uri.getScheme()) || "http".equalsIgnoreCase(uri.getScheme())) || uri.getHost() == null) {
                throw new IllegalArgumentException();
            }
        } catch (IllegalArgumentException error) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "Profile links must be valid http or https URLs.");
        }
    }

}
