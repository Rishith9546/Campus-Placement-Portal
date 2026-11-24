package com.telusko.placement_portal.service;

import com.telusko.placement_portal.dto.*;
import com.telusko.placement_portal.entity.*;
import com.telusko.placement_portal.repository.*;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.*;
import java.util.*;

@Service
public class AdminApplicationService {
    private static final Set<String> STATUSES = Set.of("APPLIED", "UNDER_REVIEW", "SHORTLISTED", "INTERVIEW_SCHEDULED", "INTERVIEWED", "SELECTED", "REJECTED");
    private final ApplicationRepo applications; private final StudentRepo students; private final JobRepo jobs;
    private final UserRepository users; private final ApplicationStageHistoryRepo history;

    public AdminApplicationService(ApplicationRepo applications, StudentRepo students, JobRepo jobs, UserRepository users, ApplicationStageHistoryRepo history) {
        this.applications=applications; this.students=students; this.jobs=jobs; this.users=users; this.history=history;
    }

    @Transactional(readOnly = true)
    public AdminApplicationPageDto list(int page, int size, String search, String status, String branch, String company, Long jobId,
                                        LocalDate startDate, LocalDate endDate, String sortBy, String sortDirection) {
        if(page<0||size<1||size>100) throw bad("Page must be non-negative and size must be between 1 and 100.");
        String normalizedStatus=blank(status)==null?null:status.trim().toUpperCase(Locale.ROOT);
        if(normalizedStatus!=null&&!STATUSES.contains(normalizedStatus)) throw bad("Unsupported application status.");
        if(startDate!=null&&endDate!=null&&startDate.isAfter(endDate)) throw bad("Start date cannot be after end date.");
        String sort=sortBy==null||sortBy.isBlank()?"appliedAt":sortBy.trim();
        if(!Set.of("appliedAt","status","id").contains(sort)) throw bad("Unsupported sort field.");
        Sort.Direction direction; try{direction=Sort.Direction.fromString(sortDirection==null?"desc":sortDirection);}catch(IllegalArgumentException e){throw bad("Sort direction must be asc or desc.");}
        Page<AdminApplicationProjection> found=applications.searchAdminApplications(blank(search),normalizedStatus,blank(branch),blank(company),jobId,
                startDate==null?null:startDate.atStartOfDay(),endDate==null?null:endDate.atTime(LocalTime.MAX),
                PageRequest.of(page,size,Sort.by(direction,sort).and(Sort.by(Sort.Direction.DESC,"id"))));
        List<AdminApplicationRowDto> rows=found.getContent().stream().map(p->new AdminApplicationRowDto(p.getApplicationId(),p.getStudentId(),p.getStudentName(),p.getStudentEmail(),p.getRollNo(),p.getBranch(),p.getCgpa(),p.getJobId(),p.getJobTitle(),p.getCompany(),p.getAppliedAt(),normalizeStatus(p.getStatus()))).toList();
        return new AdminApplicationPageDto(rows,found.getNumber(),found.getSize(),found.getTotalElements(),found.getTotalPages(),statistics(),students.findDistinctBranches(),jobs.findDistinctCompanies());
    }

    @Transactional(readOnly=true)
    public AdminApplicationStatisticsDto statistics(){
        Map<String,Long> statusCounts=new LinkedHashMap<>(); for(Object[] row:applications.countNormalizedStatuses()) statusCounts.merge(normalizeStatus(String.valueOf(row[0])),((Number)row[1]).longValue(),Long::sum);
        STATUSES.forEach(s->statusCounts.putIfAbsent(s,0L));
        List<BranchApplicationStatisticsDto> branchRows=applications.adminApplicationBranchStatistics().stream().map(r->new BranchApplicationStatisticsDto((String)r[0],num(r[1]),num(r[2]),num(r[3]),num(r[4]),num(r[5]))).toList();
        List<CompanyApplicationStatisticsDto> companyRows=applications.adminApplicationCompanyStatistics().stream().map(r->new CompanyApplicationStatisticsDto((String)r[0],num(r[1]),num(r[2]),num(r[3]),num(r[4]))).toList();
        long total=applications.count(); long unique=applications.countUniqueApplyingStudents();
        return new AdminApplicationStatisticsDto(total,statusCounts.get("APPLIED"),statusCounts.get("SHORTLISTED"),statusCounts.get("REJECTED"),statusCounts.get("SELECTED"),unique,Math.max(0,users.countByRoleIgnoreCase("STUDENT")-unique),false,branchRows,companyRows,statusCounts);
    }

    @Transactional(readOnly=true)
    public AdminApplicationDetailDto details(Long id){
        application app=applications.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Application not found."));
        Student student=app.getStudentId()==null?null:students.findById(app.getStudentId()).orElse(null);
        User studentUser=app.getStudentId()==null?null:users.findById(app.getStudentId()).orElse(null);
        Job job=app.getJobId()==null?null:jobs.findById(app.getJobId()).orElse(null);
        User recruiter=job==null||job.getRecruiterId()==null?null:users.findById(job.getRecruiterId()).orElse(null);
        List<ApplicationStageHistoryDto> changes=history.findAllByApplicationIdOrderByChangedAtAscIdAsc(id).stream().map(h->new ApplicationStageHistoryDto(h.getId(),h.getApplicationId(),h.getPreviousStage(),h.getNewStage(),h.getChangedByRecruiterId(),h.getChangedAt(),h.getNote())).toList();
        return new AdminApplicationDetailDto(app.getId(),normalizeStatus(app.getStatus()),app.getAppliedAt(),app.getStudentId(),student!=null?student.getName():studentUser==null?null:studentUser.getName(),student!=null?student.getEmail():studentUser==null?null:studentUser.getEmail(),student==null?null:student.getRollNo(),student==null?null:student.getBranch(),student==null?null:student.getCgpa(),student==null?null:student.getSkills(),student!=null&&student.getResume()!=null&&!student.getResume().isBlank(),job==null?app.getJobId():job.getId(),job==null?null:job.getTitle(),job==null?null:job.getCompany(),recruiter==null?null:recruiter.getName(),recruiter==null?null:recruiter.getEmail(),job==null?null:job.getLocation(),job==null?null:job.getJobType(),job==null?null:job.getSalary(),job==null?null:job.getDeadline(),changes);
    }
    private long num(Object value){return value==null?0:((Number)value).longValue();}
    private String normalizeStatus(String value){if(value==null||value.isBlank())return "APPLIED";return PipelineStage.parse(value).name();}
    private String blank(String value){return value==null||value.isBlank()?null:value.trim();}
    private ResponseStatusException bad(String message){return new ResponseStatusException(HttpStatus.BAD_REQUEST,message);}
}
