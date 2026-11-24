package com.telusko.placement_portal.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name="resume_analyses",uniqueConstraints=@UniqueConstraint(name="uk_resume_analysis_request",columnNames={"student_id","request_key"}),indexes={@Index(name="idx_resume_analysis_student_date",columnList="student_id,analyzed_at")})
public class ResumeAnalysis {
    public enum Status { PROCESSING, COMPLETED, FAILED }
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="student_id",nullable=false) private Student student;
    @Column(name="resume_filename",nullable=false,length=255) private String resumeFilename;
    @Column(name="request_key",nullable=false,length=100) private String requestKey;
    @Column(name="resume_sha256",nullable=false,length=64) private String resumeSha256;
    @Column(name="resume_score") private Integer resumeScore;
    @Column(name="job_match_score") private Integer jobMatchScore;
    @Column(name="job_id") private Long jobId;
    @Column(name="job_title",length=255) private String jobTitle;
    @Column(name="job_company",length=255) private String jobCompany;
    @Column(name="model_identifier",length=100) private String modelIdentifier;
    @Enumerated(EnumType.STRING) @Column(nullable=false,length=16) private Status status=Status.PROCESSING;
    @Column(name="user_message",length=500) private String userMessage;
    @Lob @Column(name="category_scores_json") private String categoryScoresJson;
    @Lob @Column(name="analysis_json") private String analysisJson;
    @Column(name="analyzed_at",nullable=false) private LocalDateTime analyzedAt;
    @PrePersist protected void onCreate(){if(analyzedAt==null)analyzedAt=LocalDateTime.now();}
    public Long getId(){return id;} public Student getStudent(){return student;} public void setStudent(Student v){student=v;}
    public String getResumeFilename(){return resumeFilename;} public void setResumeFilename(String v){resumeFilename=v;}
    public String getRequestKey(){return requestKey;} public void setRequestKey(String v){requestKey=v;}
    public String getResumeSha256(){return resumeSha256;} public void setResumeSha256(String v){resumeSha256=v;}
    public Integer getResumeScore(){return resumeScore;} public void setResumeScore(Integer v){resumeScore=v;}
    public Integer getJobMatchScore(){return jobMatchScore;} public void setJobMatchScore(Integer v){jobMatchScore=v;}
    public Long getJobId(){return jobId;} public void setJobId(Long v){jobId=v;}
    public String getJobTitle(){return jobTitle;} public void setJobTitle(String v){jobTitle=v;}
    public String getJobCompany(){return jobCompany;} public void setJobCompany(String v){jobCompany=v;}
    public String getModelIdentifier(){return modelIdentifier;} public void setModelIdentifier(String v){modelIdentifier=v;}
    public Status getStatus(){return status;} public void setStatus(Status v){status=v;}
    public String getUserMessage(){return userMessage;} public void setUserMessage(String v){userMessage=v;}
    public String getCategoryScoresJson(){return categoryScoresJson;} public void setCategoryScoresJson(String v){categoryScoresJson=v;}
    public String getAnalysisJson(){return analysisJson;} public void setAnalysisJson(String v){analysisJson=v;}
    public void setAnalyzedAt(LocalDateTime v){analyzedAt=v;}
    public LocalDateTime getAnalyzedAt(){return analyzedAt;}
}
