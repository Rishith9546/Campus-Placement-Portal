package com.telusko.placement_portal.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name="announcements", indexes={@Index(name="idx_announcement_state_publish",columnList="status,publish_at,expires_at"),@Index(name="idx_announcement_audience_branch",columnList="audience,branch")})
public class Announcement {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(nullable=false,length=180) private String title;
    @Column(nullable=false,columnDefinition="text") private String content;
    @Column(nullable=false,length=16) private String audience="ALL";
    @Column(length=100) private String branch;
    @Column(nullable=false,length=16) private String priority="NORMAL";
    @Column(nullable=false,length=16) private String status="DRAFT";
    @Column(name="publish_at") private LocalDateTime publishAt;
    @Column(name="expires_at") private LocalDateTime expiresAt;
    @Column(name="created_by_admin_id",nullable=false) private Long createdByAdminId;
    @Column(name="created_at",nullable=false) private LocalDateTime createdAt;
    @Column(name="updated_at",nullable=false) private LocalDateTime updatedAt;
    @PrePersist void onCreate(){LocalDateTime now=LocalDateTime.now();if(createdAt==null)createdAt=now;if(updatedAt==null)updatedAt=now;}
    @PreUpdate void onUpdate(){updatedAt=LocalDateTime.now();}
    public Long getId(){return id;} public void setId(Long v){id=v;} public String getTitle(){return title;} public void setTitle(String v){title=v;}
    public String getContent(){return content;} public void setContent(String v){content=v;} public String getAudience(){return audience;} public void setAudience(String v){audience=v;}
    public String getBranch(){return branch;} public void setBranch(String v){branch=v;} public String getPriority(){return priority;} public void setPriority(String v){priority=v;}
    public String getStatus(){return status;} public void setStatus(String v){status=v;} public LocalDateTime getPublishAt(){return publishAt;} public void setPublishAt(LocalDateTime v){publishAt=v;}
    public LocalDateTime getExpiresAt(){return expiresAt;} public void setExpiresAt(LocalDateTime v){expiresAt=v;} public Long getCreatedByAdminId(){return createdByAdminId;} public void setCreatedByAdminId(Long v){createdByAdminId=v;}
    public LocalDateTime getCreatedAt(){return createdAt;} public LocalDateTime getUpdatedAt(){return updatedAt;}
}
