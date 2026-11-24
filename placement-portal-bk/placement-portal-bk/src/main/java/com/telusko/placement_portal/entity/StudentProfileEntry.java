package com.telusko.placement_portal.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "student_profile_entries", indexes = @Index(name = "idx_profile_entry_student_type", columnList = "student_id,entry_type"))
public class StudentProfileEntry {
    public enum EntryType { PROJECT, CERTIFICATION, EXPERIENCE }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Enumerated(EnumType.STRING)
    @Column(name = "entry_type", nullable = false, length = 24)
    private EntryType type;

    @Column(nullable = false, length = 180)
    private String title;

    @Column(length = 180)
    private String organization;

    @Column(length = 180)
    private String role;

    @Column(length = 3000)
    private String description;

    @Column(length = 1000)
    private String technologies;

    @Column(length = 500)
    private String repositoryUrl;

    @Column(length = 500)
    private String liveUrl;

    @Column(length = 500)
    private String credentialUrl;

    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate issueDate;

    public Long getId() { return id; }
    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }
    public EntryType getType() { return type; }
    public void setType(EntryType type) { this.type = type; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getOrganization() { return organization; }
    public void setOrganization(String organization) { this.organization = organization; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getTechnologies() { return technologies; }
    public void setTechnologies(String technologies) { this.technologies = technologies; }
    public String getRepositoryUrl() { return repositoryUrl; }
    public void setRepositoryUrl(String repositoryUrl) { this.repositoryUrl = repositoryUrl; }
    public String getLiveUrl() { return liveUrl; }
    public void setLiveUrl(String liveUrl) { this.liveUrl = liveUrl; }
    public String getCredentialUrl() { return credentialUrl; }
    public void setCredentialUrl(String credentialUrl) { this.credentialUrl = credentialUrl; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public LocalDate getIssueDate() { return issueDate; }
    public void setIssueDate(LocalDate issueDate) { this.issueDate = issueDate; }
}
