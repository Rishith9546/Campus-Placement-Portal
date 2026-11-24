package com.telusko.placement_portal.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "student_dsa_problems",
        uniqueConstraints = @UniqueConstraint(name = "uk_dsa_student_dedupe", columnNames = {"student_id", "dedupe_key"}),
        indexes = @Index(name = "idx_dsa_student_updated", columnList = "student_id,updated_at"))
public class DsaProblem {
    public enum Platform { LEETCODE, GEEKSFORGEEKS, CODEFORCES, HACKERRANK, CODECHEF, OTHER }
    public enum Topic {
        ARRAYS, STRINGS, SORTING, SEARCHING, BINARY_SEARCH, HASHING, TWO_POINTERS,
        SLIDING_WINDOW, RECURSION, BACKTRACKING, LINKED_LISTS, STACK, QUEUE, TREES,
        BINARY_SEARCH_TREES, HEAPS_PRIORITY_QUEUE, GRAPHS, GREEDY,
        DYNAMIC_PROGRAMMING, BIT_MANIPULATION, TRIES, OTHER
    }
    public enum Difficulty { EASY, MEDIUM, HARD }
    public enum ProblemStatus { SOLVED, ATTEMPTED, IN_PROGRESS }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(nullable = false, length = 180)
    private String title;

    @Column(name = "problem_url", length = 800)
    private String problemUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private Platform platform;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private Topic topic;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 12)
    private Difficulty difficulty;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private ProblemStatus status;

    @Column(name = "solved_at")
    private LocalDate solvedAt;

    @Column(length = 3000)
    private String notes;

    @Column(name = "time_complexity", length = 80)
    private String timeComplexity;

    @Column(name = "space_complexity", length = 80)
    private String spaceComplexity;

    @Column(name = "dedupe_key", nullable = false, length = 71)
    private String dedupeKey;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() { updatedAt = LocalDateTime.now(); }

    public Long getId() { return id; }
    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getProblemUrl() { return problemUrl; }
    public void setProblemUrl(String problemUrl) { this.problemUrl = problemUrl; }
    public Platform getPlatform() { return platform; }
    public void setPlatform(Platform platform) { this.platform = platform; }
    public Topic getTopic() { return topic; }
    public void setTopic(Topic topic) { this.topic = topic; }
    public Difficulty getDifficulty() { return difficulty; }
    public void setDifficulty(Difficulty difficulty) { this.difficulty = difficulty; }
    public ProblemStatus getStatus() { return status; }
    public void setStatus(ProblemStatus status) { this.status = status; }
    public LocalDate getSolvedAt() { return solvedAt; }
    public void setSolvedAt(LocalDate solvedAt) { this.solvedAt = solvedAt; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public String getTimeComplexity() { return timeComplexity; }
    public void setTimeComplexity(String timeComplexity) { this.timeComplexity = timeComplexity; }
    public String getSpaceComplexity() { return spaceComplexity; }
    public void setSpaceComplexity(String spaceComplexity) { this.spaceComplexity = spaceComplexity; }
    public String getDedupeKey() { return dedupeKey; }
    public void setDedupeKey(String dedupeKey) { this.dedupeKey = dedupeKey; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
