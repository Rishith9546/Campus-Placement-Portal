package com.telusko.placement_portal.security;

import com.telusko.placement_portal.service.CustomUserDetailsService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;

import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            CustomUserDetailsService userDetailsService) {

        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        System.out.println();
        System.out.println("========== JWT FILTER ==========");

        System.out.println(
                "REQUEST: "
                        + request.getMethod()
                        + " "
                        + request.getRequestURI()
        );

        // =================================================
        // GET AUTHORIZATION HEADER
        // =================================================

        String authHeader =
                request.getHeader("Authorization");

        System.out.println(
                "AUTH HEADER: " + authHeader
        );

        // =================================================
        // NO TOKEN
        // =================================================

        if (authHeader == null ||
                !authHeader.startsWith("Bearer ")) {

            System.out.println("NO BEARER TOKEN");

            filterChain.doFilter(
                    request,
                    response
            );

            return;
        }

        // =================================================
        // GET TOKEN
        // =================================================

        String token =
                authHeader.substring(7);

        try {

            // =================================================
            // GET EMAIL FROM JWT
            // =================================================

            String email =
                    jwtService.extractEmail(token);

            System.out.println(
                    "EMAIL FROM TOKEN: " + email
            );

            // =================================================
            // CHECK EMAIL AND AUTHENTICATION
            // =================================================

            if (email != null &&
                    SecurityContextHolder
                            .getContext()
                            .getAuthentication() == null) {

                // =================================================
                // LOAD USER
                // =================================================

                UserDetails userDetails =
                        userDetailsService
                                .loadUserByUsername(email);

                System.out.println(
                        "USERNAME: "
                                + userDetails.getUsername()
                );

                System.out.println(
                        "AUTHORITIES: "
                                + userDetails.getAuthorities()
                );

                // =================================================
                // CREATE AUTHENTICATION
                // =================================================

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );

                // =================================================
                // SET REQUEST DETAILS
                // =================================================

                authentication.setDetails(
                        new WebAuthenticationDetailsSource()
                                .buildDetails(request)
                );

                // =================================================
                // SET SECURITY CONTEXT
                // =================================================

                SecurityContextHolder
                        .getContext()
                        .setAuthentication(
                                authentication
                        );

                // =================================================
                // DEBUG AUTHENTICATION
                // =================================================

                System.out.println(
                        "AUTHENTICATION SET SUCCESSFULLY"
                );

                System.out.println(
                        "IS AUTHENTICATED: "
                                + SecurityContextHolder
                                .getContext()
                                .getAuthentication()
                                .isAuthenticated()
                );

                System.out.println(
                        "FINAL USERNAME: "
                                + SecurityContextHolder
                                .getContext()
                                .getAuthentication()
                                .getName()
                );

                System.out.println(
                        "FINAL AUTHORITIES: "
                                + SecurityContextHolder
                                .getContext()
                                .getAuthentication()
                                .getAuthorities()
                );
            }

        } catch (Exception e) {

            System.out.println(
                    "========== JWT ERROR =========="
            );

            System.out.println(
                    "JWT could not be validated"
            );

            e.printStackTrace();
        }

        System.out.println(
                "==============================="
        );

        // =================================================
        // CONTINUE REQUEST
        // =================================================

        filterChain.doFilter(
                request,
                response
        );
    }
}