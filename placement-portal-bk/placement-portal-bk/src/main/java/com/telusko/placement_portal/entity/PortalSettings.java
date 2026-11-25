package com.telusko.placement_portal.entity;
import jakarta.persistence.*;
@Entity @Table(name="portal_settings") public class PortalSettings {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(nullable=false,length=120) private String portalName="Campus Placement Portal";
 @Column(length=1000) private String description="Placement opportunities and career services for students.";
 @Column(length=80) private String academicYear="";
 @Column(nullable=false) private boolean applicationsEnabled=true;
 public PortalSettings(){} public Long getId(){return id;} public String getPortalName(){return portalName;} public void setPortalName(String v){portalName=v;} public String getDescription(){return description;} public void setDescription(String v){description=v;} public String getAcademicYear(){return academicYear;} public void setAcademicYear(String v){academicYear=v;} public boolean isApplicationsEnabled(){return applicationsEnabled;} public void setApplicationsEnabled(boolean v){applicationsEnabled=v;}
}
