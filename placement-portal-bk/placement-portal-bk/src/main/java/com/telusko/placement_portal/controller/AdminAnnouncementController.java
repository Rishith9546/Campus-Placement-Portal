package com.telusko.placement_portal.controller;

import com.telusko.placement_portal.dto.*;
import com.telusko.placement_portal.security.UserPrincipal;
import com.telusko.placement_portal.service.AnnouncementService;
import com.telusko.placement_portal.service.AdminAuditService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

@RestController @RequestMapping("/api/admin/announcements") @CrossOrigin(origins="http://localhost:5173")
public class AdminAnnouncementController {
    private final AnnouncementService service;
    private final AdminAuditService audit;
    public AdminAnnouncementController(AnnouncementService service,AdminAuditService audit){this.service=service;this.audit=audit;}
    @GetMapping public AnnouncementPageDto list(@RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="10") int size,@RequestParam(required=false) String search,@RequestParam(required=false) String audience,@RequestParam(required=false) String status,@RequestParam(required=false) String priority){return service.list(page,size,search,audience,status,priority);}
    @GetMapping("/{id}") public AnnouncementDto detail(@PathVariable Long id){return service.detail(id);}
    @PostMapping @Transactional public AnnouncementDto create(@Valid @RequestBody AnnouncementRequest request,@AuthenticationPrincipal UserPrincipal admin){var result=service.create(request,admin.getId());audit.record(admin,"ANNOUNCEMENT_CREATED","ANNOUNCEMENT",result.id(),"Announcement draft created",null,"status=DRAFT");return result;}
    @PutMapping("/{id}") @Transactional public AnnouncementDto update(@PathVariable Long id,@Valid @RequestBody AnnouncementRequest request,@AuthenticationPrincipal UserPrincipal admin){var result=service.update(id,request);audit.record(admin,"ANNOUNCEMENT_EDITED","ANNOUNCEMENT",id,"Announcement edited",null,"content updated");return result;}
    @PatchMapping("/{id}/publish") @Transactional public AnnouncementDto publish(@PathVariable Long id,@AuthenticationPrincipal UserPrincipal admin){var result=service.publish(id);audit.record(admin,"ANNOUNCEMENT_PUBLISHED","ANNOUNCEMENT",id,"Announcement published",null,"status=PUBLISHED");return result;}
    @PatchMapping("/{id}/unpublish") @Transactional public AnnouncementDto unpublish(@PathVariable Long id,@AuthenticationPrincipal UserPrincipal admin){var result=service.unpublish(id);audit.record(admin,"ANNOUNCEMENT_UNPUBLISHED","ANNOUNCEMENT",id,"Announcement unpublished",null,"status=UNPUBLISHED");return result;}
    @PatchMapping("/{id}/archive") @Transactional public AnnouncementDto archive(@PathVariable Long id,@AuthenticationPrincipal UserPrincipal admin){var result=service.archive(id);audit.record(admin,"ANNOUNCEMENT_ARCHIVED","ANNOUNCEMENT",id,"Announcement archived",null,"status=ARCHIVED");return result;}
}

