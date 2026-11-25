package com.telusko.placement_portal.service;

import com.telusko.placement_portal.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Service
public class AdminAnalyticsService {
    private final UserRepository users; private final JobRepo jobs; private final ApplicationRepo apps;
    private final StudentRepo students; private final AdminApplicationService applicationService;
    public AdminAnalyticsService(UserRepository u, JobRepo j, ApplicationRepo a, StudentRepo s, AdminApplicationService as) { users=u; jobs=j; apps=a; students=s; applicationService=as; }
    @Transactional(readOnly=true)
    public Map<String,Object> overview() {
        var stats=applicationService.statistics(); Map<String,Object> m=new LinkedHashMap<>();
        m.put("totalStudents",users.countByRoleIgnoreCase("STUDENT")); m.put("eligibleStudents",null);
        m.put("placedStudents",null); m.put("placementPercentage",null); m.put("placementDataAvailable",false);
        m.put("recruiters",users.countByRoleIgnoreCase("RECRUITER")); m.put("companies",users.countRecruiterCompanies());
        m.put("jobs",jobs.count()); m.put("applications",apps.count()); m.put("shortlisted",stats.shortlisted());
        m.put("rejected",stats.rejected()); m.put("selected",stats.selected()); m.put("offers",null);
        m.put("averagePackage",null); m.put("packageDataAvailable",false); m.put("funnel",stats.statuses());
        m.put("branches",stats.byBranch()); m.put("companiesHiring",stats.byCompany()); m.put("studentBranches",students.countGroupedByBranch());
        return m;
    }
    @Transactional(readOnly=true)
    public String csv(String report) {
        StringBuilder b=new StringBuilder(); var s=applicationService.statistics();
        switch(report==null?"applications":report.toLowerCase(Locale.ROOT)) {
            case "applications" -> { b.append("Status,Applications\r\n"); s.statuses().forEach((k,v)->b.append(csvCell(k)).append(',').append(v).append("\r\n")); }
            case "branch" -> { b.append("Branch,Students,StudentsApplied,Applications,Shortlisted,Selected\r\n"); for(var r:s.byBranch()) b.append(csvCell(r.branch())).append(',').append(r.totalStudents()).append(',').append(r.studentsApplied()).append(',').append(r.applications()).append(',').append(r.shortlistedApplications()).append(',').append(r.selectedApplications()).append("\r\n"); }
            case "company" -> { b.append("Company,Jobs,Applications,Shortlisted,Selected\r\n"); for(var r:s.byCompany()) b.append(csvCell(r.company())).append(',').append(r.jobsPosted()).append(',').append(r.applications()).append(',').append(r.shortlisted()).append(',').append(r.selected()).append("\r\n"); }
            default -> throw new IllegalArgumentException("Report must be applications, branch, or company.");
        }
        return b.toString();
    }
    private String csvCell(String s){return s==null?"":"\""+s.replace("\"","\"\"")+"\"";}
}
