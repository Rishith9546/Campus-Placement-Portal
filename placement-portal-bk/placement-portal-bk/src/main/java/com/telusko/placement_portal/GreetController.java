package com.telusko.placement_portal;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class GreetController {

    @GetMapping("/")
    public String greetHello() {
        return "helloworld";
    }
}