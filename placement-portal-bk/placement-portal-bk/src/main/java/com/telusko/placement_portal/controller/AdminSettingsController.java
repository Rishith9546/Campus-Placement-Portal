package com.telusko.placement_portal.controller;
import com.telusko.placement_portal.security.UserPrincipal;import com.telusko.placement_portal.service.AdminSettingsService;import org.springframework.security.core.annotation.AuthenticationPrincipal;import org.springframework.web.bind.annotation.*;import java.util.*;
@RestController @RequestMapping("/api/admin") @CrossOrigin(origins="http://localhost:5173") public class AdminSettingsController {
 private final AdminSettingsService service;public AdminSettingsController(AdminSettingsService s){service=s;}
 @GetMapping("/settings") public Map<String,Object> settings(){return service.getSettings();}
 @PutMapping("/settings") public Map<String,Object> update(@RequestBody Map<String,Object> body,@AuthenticationPrincipal UserPrincipal admin){return service.update(body,admin);}
 @GetMapping("/profile") public Map<String,Object> profile(@AuthenticationPrincipal UserPrincipal admin){return service.profile(admin);}
 @PutMapping("/profile") public Map<String,Object> updateProfile(@RequestBody Map<String,String> body,@AuthenticationPrincipal UserPrincipal admin){return service.updateProfile(body,admin);}
 @PutMapping("/profile/change-password") public Map<String,String> changePassword(@RequestBody Map<String,String> body,@AuthenticationPrincipal UserPrincipal admin){service.changePassword(body,admin);return Map.of("message","Password updated successfully.");}
}
