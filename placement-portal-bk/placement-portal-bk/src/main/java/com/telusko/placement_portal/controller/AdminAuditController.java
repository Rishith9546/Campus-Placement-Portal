package com.telusko.placement_portal.controller;
import com.telusko.placement_portal.entity.AdminAuditLog;import com.telusko.placement_portal.service.AdminAuditService;import org.springframework.format.annotation.DateTimeFormat;import org.springframework.web.bind.annotation.*;import java.time.LocalDate;import java.util.Map;
@RestController @RequestMapping("/api/admin/audit-logs") @CrossOrigin(origins="http://localhost:5173") public class AdminAuditController {
 private final AdminAuditService service;public AdminAuditController(AdminAuditService s){service=s;}
 @GetMapping public Map<String,Object> list(@RequestParam(defaultValue="0")int page,@RequestParam(defaultValue="20")int size,@RequestParam(required=false)String search,@RequestParam(required=false)String action,@RequestParam(required=false)String entityType,@RequestParam(required=false)@DateTimeFormat(iso=DateTimeFormat.ISO.DATE)LocalDate from,@RequestParam(required=false)@DateTimeFormat(iso=DateTimeFormat.ISO.DATE)LocalDate to){return service.list(page,size,search,action,entityType,from,to);}
 @GetMapping("/{id}") public AdminAuditLog detail(@PathVariable Long id){return service.detail(id);}
}
