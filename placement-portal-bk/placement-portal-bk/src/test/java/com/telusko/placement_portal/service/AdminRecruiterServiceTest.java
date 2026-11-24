package com.telusko.placement_portal.service;

import com.telusko.placement_portal.entity.User;
import com.telusko.placement_portal.repository.ApplicationRepo;
import com.telusko.placement_portal.repository.JobRepo;
import com.telusko.placement_portal.repository.UserRepository;
import com.telusko.placement_portal.security.UserPrincipal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AdminRecruiterServiceTest {
    private UserRepository users;
    private AdminRecruiterService service;

    @BeforeEach void setUp() {
        users = mock(UserRepository.class);
        service = new AdminRecruiterService(users, mock(JobRepo.class), mock(ApplicationRepo.class));
    }

    @Test void verificationChangesOnlyRecruiterReviewStatus() {
        User recruiter = user(31L, "RECRUITER", "Northwind Systems");
        when(users.findById(31L)).thenReturn(Optional.of(recruiter));

        assertEquals("VERIFIED", service.updateVerification(31L, "verified"));
        assertEquals("VERIFIED", recruiter.getVerificationStatus());
        verify(users).save(recruiter);
    }

    @Test void verificationRejectsUnsupportedStatusAndNonRecruiterIds() {
        when(users.findById(31L)).thenReturn(Optional.of(user(31L, "STUDENT", null)));
        assertThrows(ResponseStatusException.class, () -> service.updateVerification(31L, "APPROVED"));
        assertThrows(ResponseStatusException.class, () -> service.updateVerification(31L, "VERIFIED"));
        verify(users, never()).save(any(User.class));
    }

    @Test void recruiterAccountCanBeDisabledAndAdminSelfTargetIsForbidden() {
        User recruiter = user(31L, "RECRUITER", "Northwind Systems");
        User admin = user(90L, "ADMIN", null);
        when(users.findById(31L)).thenReturn(Optional.of(recruiter));

        assertFalse(service.updateAccountStatus(31L, false, new UserPrincipal(admin)));
        assertFalse(recruiter.isEnabled());
        assertThrows(ResponseStatusException.class, () -> service.updateAccountStatus(90L, false, new UserPrincipal(admin)));
    }

    private User user(Long id, String role, String company) {
        User user = new User("Recruiter", "recruiter" + id + "@example.test", "not-a-real-password", role, company);
        try {
            var idField = User.class.getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(user, id);
        } catch (ReflectiveOperationException error) { throw new AssertionError(error); }
        return user;
    }
}
