package com.telusko.placement_portal.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "student")
public class Student {

    @Id
    private Long id;

    private String name;

    private String email;

    @Size(max = 30)
    private String phone;

    @Size(max = 80)
    private String rollNo;

    @Size(max = 100)
    private String branch;

    @DecimalMin("0.0")
    @DecimalMax("10.0")
    private Double cgpa;

    @Size(max = 1200)
    private String skills;

    private String profilePhoto;

    private String resume;

    @Size(max = 180)
    private String collegeName;
    @Size(max = 120)
    private String degree;
    @Min(1900) @Max(2200)
    private Integer graduationYear;
    @Min(0) @Max(100)
    private Integer backlogs;
    @Size(max = 500)
    private String githubProfile;
    @Size(max = 500)
    private String linkedInProfile;
    @Size(max = 500)
    private String portfolioUrl;
    private Boolean profileVisible;

    public Student() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }


    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getRollNo() {
        return rollNo;
    }

    public void setRollNo(String rollNo) {
        this.rollNo = rollNo;
    }

    public String getBranch() {
        return branch;
    }

    public void setBranch(String branch) {
        this.branch = branch;
    }

    public Double getCgpa() {
        return cgpa;
    }

    public void setCgpa(Double cgpa) {
        this.cgpa = cgpa;
    }

    public String getSkills() {
        return skills;
    }

    public void setSkills(String skills) {
        this.skills = skills;
    }

    public String getProfilePhoto() {
        return profilePhoto;
    }

    public void setProfilePhoto(String profilePhoto) {
        this.profilePhoto = profilePhoto;
    }

    public String getResume() {
        return resume;
    }

    public void setResume(String resume) {
        this.resume = resume;
    }

    public void setName(String name) {
        this.name = name;
    }
    public String getName() {
        return name;
    }
    public void setEmail(String email) {
        this.email = email;
    }
    public String getEmail() {
        return email;
    }

    public String getCollegeName() { return collegeName; }
    public void setCollegeName(String collegeName) { this.collegeName = collegeName; }
    public String getDegree() { return degree; }
    public void setDegree(String degree) { this.degree = degree; }
    public Integer getGraduationYear() { return graduationYear; }
    public void setGraduationYear(Integer graduationYear) { this.graduationYear = graduationYear; }
    public Integer getBacklogs() { return backlogs; }
    public void setBacklogs(Integer backlogs) { this.backlogs = backlogs; }
    public String getGithubProfile() { return githubProfile; }
    public void setGithubProfile(String githubProfile) { this.githubProfile = githubProfile; }
    public String getLinkedInProfile() { return linkedInProfile; }
    public void setLinkedInProfile(String linkedInProfile) { this.linkedInProfile = linkedInProfile; }
    public String getPortfolioUrl() { return portfolioUrl; }
    public void setPortfolioUrl(String portfolioUrl) { this.portfolioUrl = portfolioUrl; }
    public Boolean getProfileVisible() { return profileVisible; }
    public void setProfileVisible(Boolean profileVisible) { this.profileVisible = profileVisible; }
}
