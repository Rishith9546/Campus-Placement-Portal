package com.telusko.placement_portal.controller;

import com.telusko.placement_portal.dto.*;
import com.telusko.placement_portal.service.AdminApplicationService;
import com.telusko.placement_portal.service.AdminStudentService;
import org.springframework.core.io.Resource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/admin/applications")
@CrossOrigin(origins="http://localhost:5173")
public class AdminApplicationController {
    private final AdminApplicationService service; private final AdminStudentService students;
    public AdminApplicationController(AdminApplicationService service, AdminStudentService students){this.service=service;this.students=students;}

    @GetMapping public AdminApplicationPageDto list(@RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="10") int size,
            @RequestParam(required=false) String search,@RequestParam(required=false) String status,@RequestParam(required=false) String branch,
            @RequestParam(required=false) String company,@RequestParam(required=false) Long jobId,
            @RequestParam(required=false) @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required=false) @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue="appliedAt") String sortBy,@RequestParam(defaultValue="desc") String sortDirection){
        return service.list(page,size,search,status,branch,company,jobId,startDate,endDate,sortBy,sortDirection);
    }
    @GetMapping("/statistics") public AdminApplicationStatisticsDto statistics(){return service.statistics();}
    @GetMapping("/{id}") public AdminApplicationDetailDto details(@PathVariable Long id){return service.details(id);}
    @GetMapping("/{id}/resume") public ResponseEntity<Resource> resume(@PathVariable Long id){
        AdminApplicationDetailDto detail=service.details(id);
        if(!detail.resumeAvailable()||detail.studentId()==null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_PDF).header(HttpHeaders.CONTENT_DISPOSITION,"inline; filename=\"student-resume.pdf\"").body(students.resume(detail.studentId()));
    }
}
