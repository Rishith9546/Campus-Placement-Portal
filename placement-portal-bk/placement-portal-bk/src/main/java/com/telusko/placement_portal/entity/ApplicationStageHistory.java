package com.telusko.placement_portal.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "application_stage_history", indexes = {
        @Index(name = "idx_stage_history_app_time", columnList = "application_id,changed_at")
})
public class ApplicationStageHistory {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "application_id", nullable = false)
    private Long applicationId;
    @Column(name = "previous_stage", length = 40)
    private String previousStage;
    @Column(name = "new_stage", nullable = false, length = 40)
    private String newStage;
    @Column(name = "changed_by_recruiter_id", nullable = false)
    private Long changedByRecruiterId;
    @Column(name = "changed_at", nullable = false)
    private LocalDateTime changedAt;
    @Column(length = 1000)
    private String note;

    @PrePersist void stamp() { if (changedAt == null) changedAt = LocalDateTime.now(); }
    public Long getId() { return id; }
    public Long getApplicationId() { return applicationId; }
    public void setApplicationId(Long applicationId) { this.applicationId = applicationId; }
    public String getPreviousStage() { return previousStage; }
    public void setPreviousStage(String previousStage) { this.previousStage = previousStage; }
    public String getNewStage() { return newStage; }
    public void setNewStage(String newStage) { this.newStage = newStage; }
    public Long getChangedByRecruiterId() { return changedByRecruiterId; }
    public void setChangedByRecruiterId(Long changedByRecruiterId) { this.changedByRecruiterId = changedByRecruiterId; }
    public LocalDateTime getChangedAt() { return changedAt; }
    public void setChangedAt(LocalDateTime changedAt) { this.changedAt = changedAt; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}
