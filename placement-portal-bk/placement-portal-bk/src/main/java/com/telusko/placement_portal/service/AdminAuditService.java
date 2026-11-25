package com.telusko.placement_portal.service;
import com.telusko.placement_portal.entity.AdminAuditLog;
import com.telusko.placement_portal.repository.AdminAuditLogRepo;
import com.telusko.placement_portal.security.UserPrincipal;
import org.springframework.data.domain.*;import org.springframework.stereotype.Service;import org.springframework.transaction.annotation.Transactional;import org.springframework.http.HttpStatus;import org.springframework.web.server.ResponseStatusException;import java.time.*;import java.util.*;
@Service public class AdminAuditService {
 private final AdminAuditLogRepo repo; public AdminAuditService(AdminAuditLogRepo repo){this.repo=repo;}
 @Transactional public void record(UserPrincipal actor,String action,String type,Long id,String description,String reason,String metadata){if(actor==null)throw new IllegalArgumentException("Admin actor required");repo.save(new AdminAuditLog(actor.getId(),actor.getEmail(),action,type,id,description,reason,metadata));}
 @Transactional(readOnly=true) public Map<String,Object> list(int page,int size,String search,String action,String entity,LocalDate from,LocalDate to){if(page<0||size<1||size>100)throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Invalid page or size.");if(from!=null&&to!=null&&from.isAfter(to))throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Start date cannot be after end date.");Page<AdminAuditLog> data=repo.search(blank(search),blank(action),blank(entity),from==null?null:from.atStartOfDay(),to==null?null:to.atTime(LocalTime.MAX),PageRequest.of(page,size,Sort.by(Sort.Direction.DESC,"createdAt").and(Sort.by(Sort.Direction.DESC,"id"))));return Map.of("content",data.getContent(),"page",data.getNumber(),"size",data.getSize(),"totalElements",data.getTotalElements(),"totalPages",data.getTotalPages());}
 @Transactional(readOnly=true) public AdminAuditLog detail(Long id){return repo.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Audit record not found."));}
 private String blank(String s){return s==null||s.isBlank()?null:s.trim();}
}
