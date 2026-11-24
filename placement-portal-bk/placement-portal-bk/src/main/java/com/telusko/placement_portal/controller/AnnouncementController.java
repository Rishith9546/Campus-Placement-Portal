package com.telusko.placement_portal.controller;

import com.telusko.placement_portal.dto.AnnouncementDto;
import com.telusko.placement_portal.security.UserPrincipal;
import com.telusko.placement_portal.service.AnnouncementService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/api/announcements") @CrossOrigin(origins="http://localhost:5173")
public class AnnouncementController {
    private final AnnouncementService service;
    public AnnouncementController(AnnouncementService service){this.service=service;}
    @GetMapping public List<AnnouncementDto> feed(@AuthenticationPrincipal UserPrincipal principal){return service.feed(principal);}
    @GetMapping("/{id}") public AnnouncementDto detail(@PathVariable Long id,@AuthenticationPrincipal UserPrincipal principal){return service.visibleDetail(id,principal);}
}
