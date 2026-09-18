package com.telusko.placement_portal.controller;

import org.springframework.core.io.Resource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.telusko.placement_portal.entity.Student;
import com.telusko.placement_portal.security.UserPrincipal;
import com.telusko.placement_portal.service.StudentService;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;

@RestController
@RequestMapping("/api/student")
@CrossOrigin(origins = "http://localhost:5173")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }


    // =================================================
    // CREATE / UPDATE STUDENT PROFILE
    // =================================================

    @PostMapping("/profile")
    public Student createProfile(
            @RequestBody Student student,
            @AuthenticationPrincipal UserPrincipal user) {

        System.out.println("========== STUDENT PROFILE ==========");

        if (user == null) {
            throw new RuntimeException("User not authenticated");
        }

        System.out.println("USER ID: " + user.getId());
        System.out.println("USER EMAIL: " + user.getEmail());
        System.out.println("USER NAME: " + user.getName());
        System.out.println("AUTHORITIES: " + user.getAuthorities());

        System.out.println("=====================================");

        return studentService.createProfile(student, user);
    }


    // =================================================
    // GET STUDENT PROFILE
    // =================================================

    @GetMapping("/profile")
    public Student getProfile(
            @AuthenticationPrincipal UserPrincipal user) {

        if (user == null) {
            throw new RuntimeException("User not authenticated");
        }

        return studentService.getProfile(user.getId());
    }


    // =================================================
    // UPLOAD PROFILE PHOTO
    // =================================================

    @PostMapping("/photo")
    public ResponseEntity<?> uploadPhoto(
            @RequestParam("photo") MultipartFile photo,
            @AuthenticationPrincipal UserPrincipal user) {

        try {

            // ================= AUTHENTICATION =================

            if (user == null) {

                return ResponseEntity
                        .status(401)
                        .body("User not authenticated");
            }


            // ================= CHECK PHOTO =================

            if (photo == null || photo.isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body("No photo selected");
            }


            // ================= CHECK FILE TYPE =================

            if (photo.getContentType() == null ||
                    !photo.getContentType().startsWith("image/")) {

                return ResponseEntity
                        .badRequest()
                        .body("Only image files are allowed");
            }


            // =================================================
            // UPLOAD DIRECTORY
            // =================================================

            Path uploadDirectory =
                    Paths.get("uploads/profile/")
                            .toAbsolutePath()
                            .normalize();

            Files.createDirectories(uploadDirectory);


            // =================================================
            // ORIGINAL FILE NAME
            // =================================================

            String originalFileName =
                    photo.getOriginalFilename();

            if (originalFileName == null ||
                    originalFileName.isEmpty()) {

                originalFileName = "profile.jpg";
            }


            // =================================================
            // UNIQUE FILE NAME
            // =================================================

            String fileName =
                    user.getId()
                            + "_"
                            + System.currentTimeMillis()
                            + "_"
                            + originalFileName;


            System.out.println(
                    "Generated photo name: "
                            + fileName
            );


            // =================================================
            // FILE PATH
            // =================================================

            Path filePath =
                    uploadDirectory
                            .resolve(fileName)
                            .normalize();


            // =================================================
            // SAVE PHOTO
            // =================================================

            Files.copy(
                    photo.getInputStream(),
                    filePath,
                    StandardCopyOption.REPLACE_EXISTING
            );


            System.out.println(
                    "Photo saved for USER ID: "
                            + user.getId()
            );

            System.out.println(
                    "Photo name: "
                            + fileName
            );

            System.out.println(
                    "Photo location: "
                            + filePath
            );


            // =================================================
            // GET STUDENT
            // =================================================

            Student student =
                    studentService.getProfile(
                            user.getId()
                    );


            // =================================================
            // SAVE PHOTO FILENAME IN DATABASE
            // =================================================

            student.setProfilePhoto(fileName);

            studentService.saveStudent(student);


            System.out.println(
                    "Profile photo saved in database: "
                            + fileName
            );


            // =================================================
            // RETURN RESPONSE
            // =================================================

            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "Photo uploaded successfully",

                            "profilePhoto",
                            fileName
                    )
            );


        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .internalServerError()
                    .body(
                            "Failed to upload photo: "
                                    + e.getMessage()
                    );
        }
    }


    // =================================================
    // GET PROFILE PHOTO
    // =================================================

    @GetMapping("/photo/{filename}")
    public ResponseEntity<?> getPhoto(
            @PathVariable String filename) {

        try {

            // =================================================
            // ABSOLUTE UPLOAD DIRECTORY
            // =================================================

            Path uploadDirectory =
                    Paths.get("uploads/profile/")
                            .toAbsolutePath()
                            .normalize();


            // =================================================
            // FILE PATH
            // =================================================

            Path filePath =
                    uploadDirectory
                            .resolve(filename)
                            .normalize();


            System.out.println(
                    "Requested photo: "
                            + filename
            );

            System.out.println(
                    "Looking for photo at: "
                            + filePath
            );


            // =================================================
            // SECURITY CHECK
            // =================================================

            if (!filePath.startsWith(uploadDirectory)) {

                System.out.println(
                        "Invalid photo path"
                );

                return ResponseEntity
                        .badRequest()
                        .body("Invalid file path");
            }


            // =================================================
            // CHECK FILE
            // =================================================

            if (!Files.exists(filePath)) {

                System.out.println(
                        "Photo NOT FOUND: "
                                + filePath
                );

                return ResponseEntity
                        .notFound()
                        .build();
            }


            // =================================================
            // GET RESOURCE
            // =================================================

            Resource resource =
                    new FileSystemResource(filePath);


            // =================================================
            // CONTENT TYPE
            // =================================================

            String contentType =
                    Files.probeContentType(filePath);


            if (contentType == null) {

                contentType =
                        "application/octet-stream";
            }


            System.out.println(
                    "Photo FOUND. Sending to frontend."
            );


            // =================================================
            // RETURN PHOTO
            // =================================================

            return ResponseEntity
                    .ok()
                    .header(
                            "Content-Type",
                            contentType
                    )
                    .body(resource);


        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .internalServerError()
                    .body(
                            "Failed to load photo"
                    );
        }
    }

    @PostMapping("/resume")
    public ResponseEntity<?> uploadResume(
         @RequestParam("resume") MultipartFile resume,
         @AuthenticationPrincipal UserPrincipal user
    ){
        try {
            if(user == null) {
                return ResponseEntity.status(401).body("User not authenticated");
            }
            if(resume == null || resume.isEmpty()) {
                return ResponseEntity.status(401).body("No resume selected");
            }

            if(resume.getContentType()==null || !resume.getContentType().equals("application/pdf")){
                return ResponseEntity.badRequest().body("Only PDF Files are allowed");
            }
            String uploadDir="uploads/resume/";

            File directory = new File(uploadDir);
            if(!directory.exists()){
                directory.mkdirs();
            }
            String originalFileName =
                    resume.getOriginalFilename();
            if (originalFileName == null || originalFileName.isEmpty()) {
                originalFileName = "resume.pdf";
            }
            String fileName =
                    user.getId()
                            + "_"
                            + System.currentTimeMillis()
                            + "_"
                            + originalFileName;

            System.out.println(
                    "Generated resume name: "
                            + fileName
            );

            Path filePath=Paths.get(uploadDir, fileName);
            Files.copy(resume.getInputStream(),
                      filePath,
                    StandardCopyOption.REPLACE_EXISTING);
            System.out.println(
                    "Resume saved for USER ID: "
                            + user.getId()
            );

            System.out.println(
                    "Resume name: "
                            + fileName
            );

            Student student =
                    studentService.getProfile(
                            user.getId()
                    );

            student.setResume(fileName);

            studentService.saveStudent(student);


            System.out.println(
                    "Resume filename saved in database: "
                            + fileName
            );

            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "Resume uploaded successfully",

                            "resume",
                            fileName
                    )
            );

        }
        catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .internalServerError()
                    .body(
                            "Failed to upload resume: "
                                    + e.getMessage()
                    );
        }

    }

    // =================================================
// GET RESUME
// =================================================

    @GetMapping("/resume/{filename}")
    public ResponseEntity<?> getResume(
            @PathVariable String filename) {

        try {

            // =================================================
            // UPLOAD DIRECTORY
            // =================================================

            Path uploadDirectory =
                    Paths.get("uploads/resume/")
                            .toAbsolutePath()
                            .normalize();


            // =================================================
            // FILE PATH
            // =================================================

            Path filePath =
                    uploadDirectory
                            .resolve(filename)
                            .normalize();


            // =================================================
            // SECURITY CHECK
            // =================================================

            if (!filePath.startsWith(uploadDirectory)) {

                return ResponseEntity
                        .badRequest()
                        .body("Invalid file path");
            }


            // =================================================
            // CHECK FILE
            // =================================================

            if (!Files.exists(filePath)) {

                return ResponseEntity
                        .notFound()
                        .build();
            }


            // =================================================
            // RESOURCE
            // =================================================

            Resource resource =
                    new FileSystemResource(filePath);


            // =================================================
            // RETURN PDF
            // =================================================

            return ResponseEntity
                    .ok()
                    .contentType(
                            MediaType.APPLICATION_PDF
                    )
                    .body(resource);


        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .internalServerError()
                    .body("Failed to load resume");
        }
    }
}