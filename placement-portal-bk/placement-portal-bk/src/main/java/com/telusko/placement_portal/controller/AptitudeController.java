package com.telusko.placement_portal.controller;

import com.telusko.placement_portal.dto.*;
import com.telusko.placement_portal.security.UserPrincipal;
import com.telusko.placement_portal.service.AptitudeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/student/aptitude")
public class AptitudeController {
    private final AptitudeService service;
    public AptitudeController(AptitudeService service){this.service=service;}
    @GetMapping("/catalog") public List<AptitudeCatalogCategoryDto> catalog(){return service.catalog();}
    @GetMapping("/analytics") public AptitudeAnalyticsDto analytics(@AuthenticationPrincipal UserPrincipal p){return service.analytics(p);}
    @GetMapping("/history") public List<AptitudeHistoryItemDto> history(@AuthenticationPrincipal UserPrincipal p){return service.history(p);}
    @GetMapping("/sessions/active") public Optional<AptitudeSessionDto> active(@AuthenticationPrincipal UserPrincipal p){return service.active(p);}
    @PostMapping("/sessions") @ResponseStatus(HttpStatus.CREATED) public AptitudeSessionDto start(@AuthenticationPrincipal UserPrincipal p,@Valid @RequestBody AptitudeStartRequest request){return service.start(p,request);}
    @GetMapping("/sessions/{id}") public AptitudeSessionDto session(@AuthenticationPrincipal UserPrincipal p,@PathVariable long id){return service.session(p,id);}
    @PutMapping("/sessions/{id}/answers/{questionId}") public AptitudeAnswerResultDto answer(@AuthenticationPrincipal UserPrincipal p,@PathVariable long id,@PathVariable long questionId,@Valid @RequestBody AptitudeAnswerRequest request){return service.answer(p,id,questionId,request);}
    @PostMapping("/sessions/{id}/submit") public AptitudeResultDto submit(@AuthenticationPrincipal UserPrincipal p,@PathVariable long id){return service.submit(p,id);}
    @GetMapping("/attempts/{id}") public AptitudeResultDto result(@AuthenticationPrincipal UserPrincipal p,@PathVariable long id){return service.getResult(p,id);}
}
