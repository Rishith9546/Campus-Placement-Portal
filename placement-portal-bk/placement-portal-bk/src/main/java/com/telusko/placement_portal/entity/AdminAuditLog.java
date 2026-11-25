package com.telusko.placement_portal.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name="admin_audit_logs", indexes={@Index(name="idx_audit_created",columnList="createdAt"),@Index(name="idx_audit_entity",columnList="entityType,entityId")})
public class AdminAuditLog {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    private Long adminId;
    @Column(length=200) private String adminEmail;
    @Column(nullable=false,length=80) private String action;
    @Column(nullable=false,length=80) private String entityType;
    private Long entityId;
    @Column(length=1000) private String description;
    @Column(length=500) private String reason;
    @Column(length=1000) private String safeMetadata;
    @Column(nullable=false) private LocalDateTime createdAt=LocalDateTime.now();
    protected AdminAuditLog() {}
    public AdminAuditLog(Long adminId,String adminEmail,String action,String entityType,Long entityId,String description,String reason,String safeMetadata){this.adminId=adminId;this.adminEmail=adminEmail;this.action=action;this.entityType=entityType;this.entityId=entityId;this.description=description;this.reason=reason;this.safeMetadata=safeMetadata;}
    public Long getId(){return id;} public Long getAdminId(){return adminId;} public String getAdminEmail(){return adminEmail;} public String getAction(){return action;} public String getEntityType(){return entityType;} public Long getEntityId(){return entityId;} public String getDescription(){return description;} public String getReason(){return reason;} public String getSafeMetadata(){return safeMetadata;} public LocalDateTime getCreatedAt(){return createdAt;}
}
