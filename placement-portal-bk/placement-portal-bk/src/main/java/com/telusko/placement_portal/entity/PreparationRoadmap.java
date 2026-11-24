package com.telusko.placement_portal.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name="preparation_roadmaps", indexes={@Index(name="idx_roadmap_student_created",columnList="student_id,created_at")})
public class PreparationRoadmap {
    public enum Status { ACTIVE, COMPLETED, ARCHIVED }
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="student_id",nullable=false) private Student student;
    @Column(nullable=false,length=160) private String name;
    @Column(name="start_date",nullable=false) private LocalDate startDate;
    @Column(name="duration_weeks",nullable=false) private int durationWeeks;
    @Column(name="daily_minutes",nullable=false) private int dailyMinutes;
    @Column(length=500) private String focus;
    @Column(name="planner_source",nullable=false,length=20) private String plannerSource;
    @Enumerated(EnumType.STRING) @Column(nullable=false,length=16) private Status status=Status.ACTIVE;
    @Lob @Column(name="preparation_snapshot") private String preparationSnapshot;
    @Column(name="created_at",nullable=false) private LocalDateTime createdAt;
    @Column(name="updated_at",nullable=false) private LocalDateTime updatedAt;
    @PrePersist protected void onCreate(){LocalDateTime now=LocalDateTime.now();createdAt=now;updatedAt=now;}
    @PreUpdate protected void onUpdate(){updatedAt=LocalDateTime.now();}
    public Long getId(){return id;} public Student getStudent(){return student;} public void setStudent(Student v){student=v;}
    public String getName(){return name;} public void setName(String v){name=v;} public LocalDate getStartDate(){return startDate;} public void setStartDate(LocalDate v){startDate=v;}
    public int getDurationWeeks(){return durationWeeks;} public void setDurationWeeks(int v){durationWeeks=v;} public int getDailyMinutes(){return dailyMinutes;} public void setDailyMinutes(int v){dailyMinutes=v;}
    public String getFocus(){return focus;} public void setFocus(String v){focus=v;} public String getPlannerSource(){return plannerSource;} public void setPlannerSource(String v){plannerSource=v;}
    public Status getStatus(){return status;} public void setStatus(Status v){status=v;} public String getPreparationSnapshot(){return preparationSnapshot;} public void setPreparationSnapshot(String v){preparationSnapshot=v;}
    public LocalDateTime getCreatedAt(){return createdAt;} public LocalDateTime getUpdatedAt(){return updatedAt;}
}
