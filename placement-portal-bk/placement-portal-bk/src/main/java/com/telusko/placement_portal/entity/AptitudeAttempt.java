package com.telusko.placement_portal.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "aptitude_attempts", indexes = {
        @Index(name = "idx_aptitude_attempt_student_started", columnList = "student_id,started_at"),
        @Index(name = "idx_aptitude_attempt_expiry", columnList = "status,expires_at")
})
public class AptitudeAttempt {
    public enum Mode { PRACTICE, TIMED_TEST }
    public enum Status { ACTIVE, COMPLETED, TIME_EXPIRED }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private Mode mode;

    @Enumerated(EnumType.STRING)
    @Column(length = 32)
    private AptitudeQuestion.Category category;

    @Enumerated(EnumType.STRING)
    @Column(length = 40)
    private AptitudeQuestion.Topic topic;

    @Enumerated(EnumType.STRING)
    @Column(length = 12)
    private AptitudeQuestion.Difficulty difficulty;

    @Column(nullable = false)
    private int questionCount;

    private Integer durationSeconds;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private Status status = Status.ACTIVE;

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    private Integer correctCount;
    private Integer incorrectCount;
    private Integer unansweredCount;
    private Integer scorePercentage;
    private Integer accuracyPercentage;
    private Integer timeTakenSeconds;

    @PrePersist
    protected void onCreate() { if (startedAt == null) startedAt = LocalDateTime.now(); }

    public Long getId() { return id; }
    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }
    public Mode getMode() { return mode; }
    public void setMode(Mode mode) { this.mode = mode; }
    public AptitudeQuestion.Category getCategory() { return category; }
    public void setCategory(AptitudeQuestion.Category category) { this.category = category; }
    public AptitudeQuestion.Topic getTopic() { return topic; }
    public void setTopic(AptitudeQuestion.Topic topic) { this.topic = topic; }
    public AptitudeQuestion.Difficulty getDifficulty() { return difficulty; }
    public void setDifficulty(AptitudeQuestion.Difficulty difficulty) { this.difficulty = difficulty; }
    public int getQuestionCount() { return questionCount; }
    public void setQuestionCount(int questionCount) { this.questionCount = questionCount; }
    public Integer getDurationSeconds() { return durationSeconds; }
    public void setDurationSeconds(Integer durationSeconds) { this.durationSeconds = durationSeconds; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
    public Integer getCorrectCount() { return correctCount; }
    public void setCorrectCount(Integer correctCount) { this.correctCount = correctCount; }
    public Integer getIncorrectCount() { return incorrectCount; }
    public void setIncorrectCount(Integer incorrectCount) { this.incorrectCount = incorrectCount; }
    public Integer getUnansweredCount() { return unansweredCount; }
    public void setUnansweredCount(Integer unansweredCount) { this.unansweredCount = unansweredCount; }
    public Integer getScorePercentage() { return scorePercentage; }
    public void setScorePercentage(Integer scorePercentage) { this.scorePercentage = scorePercentage; }
    public Integer getAccuracyPercentage() { return accuracyPercentage; }
    public void setAccuracyPercentage(Integer accuracyPercentage) { this.accuracyPercentage = accuracyPercentage; }
    public Integer getTimeTakenSeconds() { return timeTakenSeconds; }
    public void setTimeTakenSeconds(Integer timeTakenSeconds) { this.timeTakenSeconds = timeTakenSeconds; }
}
