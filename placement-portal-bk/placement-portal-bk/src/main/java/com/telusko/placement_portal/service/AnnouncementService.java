package com.telusko.placement_portal.service;

import com.telusko.placement_portal.dto.*;
import com.telusko.placement_portal.entity.Announcement;
import com.telusko.placement_portal.entity.Student;
import com.telusko.placement_portal.repository.*;
import com.telusko.placement_portal.security.UserPrincipal;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class AnnouncementService {
    private static final Set<String> AUDIENCES=Set.of("ALL","STUDENTS","RECRUITERS","BRANCH");
    private static final Set<String> PRIORITIES=Set.of("NORMAL","IMPORTANT","URGENT");
    private static final Set<String> STATUSES=Set.of("DRAFT","PUBLISHED","UNPUBLISHED","ARCHIVED");
    private final AnnouncementRepo repo; private final StudentRepo students;
    public AnnouncementService(AnnouncementRepo repo,StudentRepo students){this.repo=repo;this.students=students;}

    @Transactional(readOnly=true)
    public AnnouncementPageDto list(int page,int size,String search,String audience,String status,String priority){
        if(page<0||size<1||size>100)throw bad("Page must be non-negative and size must be between 1 and 100.");
        String a=filter(audience,AUDIENCES,"Unsupported audience."),s=filter(status,STATUSES,"Unsupported announcement status."),p=filter(priority,PRIORITIES,"Unsupported priority.");
        Page<Announcement> data=repo.searchAdmin(blank(search),a,s,p,PageRequest.of(page,size,Sort.by(Sort.Direction.DESC,"createdAt").and(Sort.by(Sort.Direction.DESC,"id"))));
        return new AnnouncementPageDto(data.getContent().stream().map(this::dto).toList(),data.getNumber(),data.getSize(),data.getTotalElements(),data.getTotalPages());
    }
    @Transactional(readOnly=true) public AnnouncementDto detail(Long id){return dto(require(id));}
    @Transactional public AnnouncementDto create(AnnouncementRequest request,Long adminId){Announcement a=new Announcement();a.setCreatedByAdminId(adminId);a.setStatus("DRAFT");apply(a,request);return dto(repo.save(a));}
    @Transactional public AnnouncementDto update(Long id,AnnouncementRequest request){Announcement a=require(id);if("ARCHIVED".equals(a.getStatus()))throw conflict("Archived announcements cannot be edited.");apply(a,request);return dto(repo.save(a));}
    @Transactional public AnnouncementDto publish(Long id){Announcement a=require(id);if("ARCHIVED".equals(a.getStatus()))throw conflict("Archived announcements cannot be published.");if("PUBLISHED".equals(a.getStatus()))throw conflict("This announcement is already published.");if(a.getExpiresAt()!=null&&!a.getExpiresAt().isAfter(LocalDateTime.now()))throw bad("Expiry must be in the future before publishing.");if(a.getPublishAt()==null)a.setPublishAt(LocalDateTime.now());a.setStatus("PUBLISHED");return dto(repo.save(a));}
    @Transactional public AnnouncementDto unpublish(Long id){Announcement a=require(id);if(!"PUBLISHED".equals(a.getStatus()))throw conflict("Only published announcements can be unpublished.");a.setStatus("UNPUBLISHED");return dto(repo.save(a));}
    @Transactional public AnnouncementDto archive(Long id){Announcement a=require(id);if("ARCHIVED".equals(a.getStatus()))throw conflict("This announcement is already archived.");a.setStatus("ARCHIVED");return dto(repo.save(a));}
    @Transactional(readOnly=true) public List<AnnouncementDto> feed(UserPrincipal principal){
        String role=audienceRole(principal);String branch=studentBranch(principal,role);
        return repo.visibleTo(role,blank(branch),LocalDateTime.now(),PageRequest.of(0,50)).stream().map(this::dto).toList();
    }
    @Transactional(readOnly=true) public AnnouncementDto visibleDetail(Long id,UserPrincipal principal){
        String role=audienceRole(principal),branch=studentBranch(principal,role);
        return repo.visibleById(id,role,blank(branch),LocalDateTime.now()).map(this::dto).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Announcement not found."));
    }
    private String audienceRole(UserPrincipal principal){return principal.getAuthorities().stream().map(x->x.getAuthority()).anyMatch("ROLE_STUDENT"::equals)?"STUDENTS":"RECRUITERS";}
    private String studentBranch(UserPrincipal principal,String role){if(!"STUDENTS".equals(role))return null;Student s=students.findById(principal.getId()).orElse(null);return s==null?null:s.getBranch();}
    private void apply(Announcement a,AnnouncementRequest r){
        String audience=filter(r.audience(),AUDIENCES,"Audience must be ALL, STUDENTS, RECRUITERS, or BRANCH.");
        String priority=filter(r.priority(),PRIORITIES,"Priority must be NORMAL, IMPORTANT, or URGENT.");
        String branch=null;
        if("BRANCH".equals(audience)){
            if(blank(r.branch())==null)throw bad("Choose a branch for branch-targeted announcements.");
            branch=students.findDistinctBranches().stream().filter(b->b.equalsIgnoreCase(r.branch().trim())).findFirst().orElseThrow(()->bad("The selected branch is not present in student profiles."));
        }
        if(r.publishAt()!=null&&r.expiresAt()!=null&&!r.expiresAt().isAfter(r.publishAt()))throw bad("Expiry must be after the publish date.");
        if(r.expiresAt()!=null&&(r.publishAt()==null?!r.expiresAt().isAfter(LocalDateTime.now()):r.publishAt().isBefore(LocalDateTime.now())&&!r.expiresAt().isAfter(LocalDateTime.now())))throw bad("Expiry must be in the future for an announcement that can be shown now.");
        a.setTitle(r.title().trim());a.setContent(r.content().trim());a.setAudience(audience);a.setBranch(branch);a.setPriority(priority);a.setPublishAt(r.publishAt());a.setExpiresAt(r.expiresAt());
    }
    private Announcement require(Long id){return repo.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Announcement not found."));}
    private AnnouncementDto dto(Announcement a){return new AnnouncementDto(a.getId(),a.getTitle(),a.getContent(),a.getAudience(),a.getBranch(),a.getPriority(),a.getStatus(),a.getPublishAt(),a.getExpiresAt(),a.getCreatedByAdminId(),a.getCreatedAt(),a.getUpdatedAt());}
    private String filter(String v,Set<String> allowed,String error){String s=blank(v);if(s==null)return null;s=s.toUpperCase(Locale.ROOT);if(!allowed.contains(s))throw bad(error);return s;}
    private String blank(String v){return v==null||v.isBlank()?null:v.trim();}
    private ResponseStatusException bad(String m){return new ResponseStatusException(HttpStatus.BAD_REQUEST,m);} private ResponseStatusException conflict(String m){return new ResponseStatusException(HttpStatus.CONFLICT,m);}
}
