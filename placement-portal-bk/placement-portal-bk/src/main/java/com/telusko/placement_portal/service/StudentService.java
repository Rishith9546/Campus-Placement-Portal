package com.telusko.placement_portal.service;

import org.springframework.stereotype.Service;

import com.telusko.placement_portal.entity.Student;
import com.telusko.placement_portal.repository.StudentRepo;
import com.telusko.placement_portal.security.UserPrincipal;

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
        }


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


        // IMPORTANT:
        // Do NOT set profilePhoto here.
        // Do NOT set resume here.
        //
        // This preserves existing uploaded files.


        return studentRepository.save(
                existingStudent
        );
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


    // =================================================
    // SAVE STUDENT
    // =================================================

    public Student saveStudent(Student student) {

        return studentRepository.save(student);
    }
}