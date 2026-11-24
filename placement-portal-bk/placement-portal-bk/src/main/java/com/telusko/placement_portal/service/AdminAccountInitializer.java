package com.telusko.placement_portal.service;

import com.telusko.placement_portal.entity.User;
import com.telusko.placement_portal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminAccountInitializer implements ApplicationRunner {
    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email:}")
    private String email;

    @Value("${app.admin.password:}")
    private String password;

    public AdminAccountInitializer(UserRepository users, PasswordEncoder passwordEncoder) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (email.isBlank() && password.isBlank()) return;
        if (email.isBlank() || password.isBlank()) {
            throw new IllegalStateException("Set both APP_ADMIN_EMAIL and APP_ADMIN_PASSWORD to create the initial admin account.");
        }
        if (password.length() < 12) {
            throw new IllegalStateException("APP_ADMIN_PASSWORD must be at least 12 characters long.");
        }
        var existing = users.findByEmail(email);
        if (existing.isPresent()) {
            if (!"ADMIN".equals(existing.get().getRole())) {
                throw new IllegalStateException("The configured admin email already belongs to a non-admin account.");
            }
            return;
        }

        User admin = new User();
        admin.setName("Portal Administrator");
        admin.setEmail(email);
        admin.setPassword(passwordEncoder.encode(password));
        admin.setRole("ADMIN");
        users.save(admin);
    }
}
