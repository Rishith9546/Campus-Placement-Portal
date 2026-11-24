package com.telusko.placement_portal.service;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
@Component
public class AptitudeExpiryScheduler {
    private final AptitudeService service;
    public AptitudeExpiryScheduler(AptitudeService service){this.service=service;}
    @Scheduled(fixedDelay=30000) public void submitExpiredTests(){service.expireOverdue();}
}
