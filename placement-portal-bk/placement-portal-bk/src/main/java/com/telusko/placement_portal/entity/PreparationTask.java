package com.telusko.placement_portal.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name="preparation_tasks",uniqueConstraints=@UniqueConstraint(name="uk_roadmap_task_dedupe",columnNames={"roadmap_id","dedupe_key"}),indexes={@Index(name="idx_roadmap_task_date",columnList="roadmap_id,scheduled_date")})
public class PreparationTask {
    public enum Category { DSA, APTITUDE, TECHNICAL, RESUME, JOB_SKILLS, INTERVIEW_PREPARATION, PROFILE, GENERAL }
    public enum Priority { HIGH, MEDIUM, LOW }
    public enum TaskType { AI_RECOMMENDED, SYSTEM_RECOMMENDED, STUDENT_CREATED }
    public enum Status { TODO, IN_PROGRESS, COMPLETED, SKIPPED }
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="roadmap_id",nullable=false) private PreparationRoadmap roadmap;
    @Column(name="dedupe_key",nullable=false,length=180) private String dedupeKey;
    @Column(nullable=false,length=180) private String title;
    @Lob @Column(nullable=false) private String description;
    @Enumerated(EnumType.STRING) @Column(nullable=false,length=20) private Category category;
    @Column(length=120) private String topic;
    @Enumerated(EnumType.STRING) @Column(nullable=false,length=12) private Priority priority;
    @Column(name="priority_score") private Integer priorityScore;
    @Column(name="estimated_minutes",nullable=false) private int estimatedMinutes;
    @Column(name="scheduled_date",nullable=false) private LocalDate scheduledDate;
    @Enumerated(EnumType.STRING) @Column(name="task_type",nullable=false,length=20) private TaskType taskType;
    @Column(name="recommendation_reason",length=1200) private String recommendationReason;
    @Enumerated(EnumType.STRING) @Column(nullable=false,length=12) private Status status=Status.TODO;
    @Column(name="resource_link",length=800) private String resourceLink;
    @Lob private String notes;
    @Column(name="skip_reason",length=500) private String skipReason;
    @Column(name="completed_at") private LocalDateTime completedAt;
    @Column(name="reopened_at") private LocalDateTime reopenedAt;
    @Column(name="created_at",nullable=false) private LocalDateTime createdAt;
    @Column(name="updated_at",nullable=false) private LocalDateTime updatedAt;
    @PrePersist protected void onCreate(){LocalDateTime now=LocalDateTime.now();createdAt=now;updatedAt=now;}
    @PreUpdate protected void onUpdate(){updatedAt=LocalDateTime.now();}
    public Long getId(){return id;} public PreparationRoadmap getRoadmap(){return roadmap;} public void setRoadmap(PreparationRoadmap v){roadmap=v;}
    public String getDedupeKey(){return dedupeKey;} public void setDedupeKey(String v){dedupeKey=v;} public String getTitle(){return title;} public void setTitle(String v){title=v;}
    public String getDescription(){return description;} public void setDescription(String v){description=v;} public Category getCategory(){return category;} public void setCategory(Category v){category=v;}
    public String getTopic(){return topic;} public void setTopic(String v){topic=v;} public Priority getPriority(){return priority;} public void setPriority(Priority v){priority=v;}
    public int getPriorityScore(){return priorityScore==null?switch(priority){case HIGH->75;case MEDIUM->50;case LOW->25;}:Math.max(0,Math.min(100,priorityScore));} public void setPriorityScore(Integer v){priorityScore=v;}
    public int getEstimatedMinutes(){return estimatedMinutes;} public void setEstimatedMinutes(int v){estimatedMinutes=v;} public LocalDate getScheduledDate(){return scheduledDate;} public void setScheduledDate(LocalDate v){scheduledDate=v;}
    public TaskType getTaskType(){return taskType;} public void setTaskType(TaskType v){taskType=v;} public String getRecommendationReason(){return recommendationReason;} public void setRecommendationReason(String v){recommendationReason=v;}
    public Status getStatus(){return status;} public void setStatus(Status v){status=v;} public String getResourceLink(){return resourceLink;} public void setResourceLink(String v){resourceLink=v;}
    public String getNotes(){return notes;} public void setNotes(String v){notes=v;} public String getSkipReason(){return skipReason;} public void setSkipReason(String v){skipReason=v;}
    public LocalDateTime getCompletedAt(){return completedAt;} public void setCompletedAt(LocalDateTime v){completedAt=v;} public LocalDateTime getReopenedAt(){return reopenedAt;} public void setReopenedAt(LocalDateTime v){reopenedAt=v;}
    public LocalDateTime getCreatedAt(){return createdAt;} public LocalDateTime getUpdatedAt(){return updatedAt;}
}
