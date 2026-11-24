package com.telusko.placement_portal.controller;

import com.telusko.placement_portal.dto.*;
import com.telusko.placement_portal.security.UserPrincipal;
import com.telusko.placement_portal.service.AnnouncementService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/admin/announcements") @CrossOrigin(origins="http://localhost:5173")
public class AdminAnnouncementController {
    private final AnnouncementService service;
    public AdminAnnouncementController(AnnouncementService service){this.service=service;}
    @GetMapping public AnnouncementPageDto list(@RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="10") int size,@RequestParam(required=false) String search,@RequestParam(required=false) String audience,@RequestParam(required=false) String status,@RequestParam(required=false) String priority){return service.list(page,size,search,audience,status,priority);}
    @GetMapping("/{id}") public AnnouncementDto detail(@PathVariable Long id){return service.detail(id);}
    @PostMapping public AnnouncementDto create(@Valid @RequestBody AnnouncementRequest request,@AuthenticationPrincipal UserPrincipal admin){return service.create(request,admin.getId());}
    @PutMapping("/{id}") public AnnouncementDto update(@PathVariable Long id,@Valid @RequestBody AnnouncementRequest request){return service.update(id,request);}
    @PatchMapping("/{id}/publish") public AnnouncementDto publish(@PathVariable Long id){return service.publish(id);}
    @PatchMapping("/{id}/unpublish") public AnnouncementDto unpublish(@PathVariable Long id){return service.unpublish(id);}
    @PatchMapping("/{id}/archive") public AnnouncementDto archive(@PathVariable Long id){return service.archive(id);}
}
