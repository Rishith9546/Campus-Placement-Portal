package com.telusko.placement_portal.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Setter
    @Column(nullable = false)
    private String name;

    @Setter
    @Column(nullable = false, unique = true)
    private String email;

    @Setter
    @Column(nullable = false)
    private String password;

    @Setter
    @Column(nullable = false)
    private String role;

    // Only recruiters will use this
    @Setter
    @Column
    private String companyName;

    // Required by JPA
    public User() {
    }

    // Student constructor
    public User(String name, String email, String password, String role) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
    }

    // Recruiter constructor
    public User(
            String name,
            String email,
            String password,
            String role,
            String companyName
    ) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
        this.companyName = companyName;
    }
}