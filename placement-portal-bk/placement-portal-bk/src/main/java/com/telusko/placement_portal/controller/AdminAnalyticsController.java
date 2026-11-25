package com.telusko.placement_portal.controller;
import com.telusko.placement_portal.service.AdminAnalyticsService;import org.springframework.http.*;import org.springframework.web.bind.annotation.*;import java.util.Map;
@RestController @RequestMapping("/api/admin/analytics") @CrossOrigin(origins="http://localhost:5173") public class AdminAnalyticsController {
 private final AdminAnalyticsService service;public AdminAnalyticsController(AdminAnalyticsService s){service=s;}
 @GetMapping({"","/overview"}) public Map<String,Object> overview(){return service.overview();}
 @GetMapping("/branches") public Object branches(){return service.overview().get("branches");}
 @GetMapping("/companies") public Object companies(){return service.overview().get("companiesHiring");}
 @GetMapping("/application-funnel") public Object funnel(){return service.overview().get("funnel");}
 @GetMapping("/packages") public Map<String,Object> packages(){return Map.of("available",false,"reason","The project has no structured offer or package records; job salary is freeform text.");}
 @GetMapping("/trends") public Map<String,Object> trends(){return Map.of("available",false,"reason","Application timestamps exist, but no academic-year/offer history is currently modeled.");}
 @GetMapping("/reports") public ResponseEntity<String> report(@RequestParam(defaultValue="applications") String type){try{return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION,"attachment; filename=placement-"+type+"-report.csv").contentType(MediaType.parseMediaType("text/csv")).body(service.csv(type));}catch(IllegalArgumentException e){return ResponseEntity.badRequest().body(e.getMessage());}}
}
