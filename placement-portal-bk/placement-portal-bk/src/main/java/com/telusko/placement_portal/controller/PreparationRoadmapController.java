package com.telusko.placement_portal.controller;

import com.telusko.placement_portal.dto.*;
import com.telusko.placement_portal.entity.PreparationTask;
import com.telusko.placement_portal.security.UserPrincipal;
import com.telusko.placement_portal.service.PreparationRoadmapService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/student/roadmaps")
public class PreparationRoadmapController {
    private final PreparationRoadmapService service;
    public PreparationRoadmapController(PreparationRoadmapService service){this.service=service;}
    @PostMapping @ResponseStatus(HttpStatus.CREATED) public PreparationRoadmapDto generate(@AuthenticationPrincipal UserPrincipal p,@Valid @RequestBody RoadmapGenerateRequest request){return service.generate(p,request);}
    @GetMapping("/active") public PreparationRoadmapDto active(@AuthenticationPrincipal UserPrincipal p){return service.active(p);}
    @GetMapping("/history") public List<PreparationRoadmapDto> history(@AuthenticationPrincipal UserPrincipal p){return service.history(p);}
    @GetMapping("/{id}") public PreparationRoadmapDto get(@AuthenticationPrincipal UserPrincipal p,@PathVariable long id){return service.get(p,id);}
    @GetMapping("/{id}/tasks") public List<PreparationTaskDto> daily(@AuthenticationPrincipal UserPrincipal p,@PathVariable long id,@RequestParam @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate date){return service.daily(p,id,date);}
    @GetMapping("/{id}/tasks/today") public List<PreparationTaskDto> today(@AuthenticationPrincipal UserPrincipal p,@PathVariable long id){return service.daily(p,id,LocalDate.now());}
    @GetMapping("/{id}/tasks/upcoming") public List<PreparationTaskDto> upcoming(@AuthenticationPrincipal UserPrincipal p,@PathVariable long id){return service.upcoming(p,id);}
    @GetMapping("/{id}/tasks/filter") public List<PreparationTaskDto> filterTasks(@AuthenticationPrincipal UserPrincipal p,@PathVariable long id,@RequestParam(required=false) PreparationTask.Status status,@RequestParam(required=false) PreparationTask.Category category,@RequestParam(required=false) PreparationTask.Priority priority,@RequestParam(required=false) @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate from,@RequestParam(required=false) @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate to){return service.filterTasks(p,id,status,category,priority,from,to);}
    @GetMapping("/{id}/weekly") public RoadmapWeeklyAnalyticsDto weekly(@AuthenticationPrincipal UserPrincipal p,@PathVariable long id,@RequestParam(required=false) @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate weekStart){return service.weekly(p,id,weekStart);}
    @PostMapping("/{id}/adapt") public PreparationRoadmapDto adapt(@AuthenticationPrincipal UserPrincipal p,@PathVariable long id,@Valid @RequestBody RoadmapAdaptRequest request){return service.adapt(p,id,request);}
    @PostMapping("/{id}/tasks") @ResponseStatus(HttpStatus.CREATED) public PreparationTaskDto createTask(@AuthenticationPrincipal UserPrincipal p,@PathVariable long id,@Valid @RequestBody RoadmapTaskCreateRequest request){return service.createTask(p,id,request);}
    @PutMapping("/tasks/{taskId}") public PreparationTaskDto updateTask(@AuthenticationPrincipal UserPrincipal p,@PathVariable long taskId,@Valid @RequestBody RoadmapTaskEditRequest request){return service.updateTask(p,taskId,request);}
    @PutMapping("/tasks/{taskId}/status") public PreparationTaskDto status(@AuthenticationPrincipal UserPrincipal p,@PathVariable long taskId,@Valid @RequestBody RoadmapTaskStatusRequest request){return service.taskStatus(p,taskId,request);}
    @PutMapping("/tasks/{taskId}/reschedule") public PreparationTaskDto reschedule(@AuthenticationPrincipal UserPrincipal p,@PathVariable long taskId,@Valid @RequestBody RoadmapTaskDateRequest request){return service.reschedule(p,taskId,request);}
    @PutMapping("/tasks/{taskId}/notes") public PreparationTaskDto notes(@AuthenticationPrincipal UserPrincipal p,@PathVariable long taskId,@Valid @RequestBody RoadmapTaskNotesRequest request){return service.notes(p,taskId,request);}
    @DeleteMapping("/tasks/{taskId}") @ResponseStatus(HttpStatus.NO_CONTENT) public void deleteTask(@AuthenticationPrincipal UserPrincipal p,@PathVariable long taskId){service.deleteTask(p,taskId);}
}
