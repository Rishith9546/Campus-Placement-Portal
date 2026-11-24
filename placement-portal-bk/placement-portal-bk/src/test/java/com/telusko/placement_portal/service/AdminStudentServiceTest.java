package com.telusko.placement_portal.service;

import com.telusko.placement_portal.entity.User;
import com.telusko.placement_portal.repository.ApplicationRepo;
import com.telusko.placement_portal.repository.JobRepo;
import com.telusko.placement_portal.repository.StudentProfileEntryRepository;
import com.telusko.placement_portal.repository.StudentRepo;
import com.telusko.placement_portal.repository.UserRepository;
import com.telusko.placement_portal.security.UserPrincipal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AdminStudentServiceTest {
    private UserRepository users;
    private AdminStudentService service;

    @BeforeEach void setUp() {
        users = mock(UserRepository.class);
        service = new AdminStudentService(users, mock(StudentRepo.class), mock(ApplicationRepo.class),
                mock(JobRepo.class), mock(StudentProfileEntryRepository.class));
    }

    @Test void deactivationChangesOnlyStudentAccountFlag() {
        User student = user(41L, "STUDENT");
        when(users.findById(41L)).thenReturn(Optional.of(student));
        when(users.save(student)).thenReturn(student);

        assertFalse(service.setEnabled(41L, false, new UserPrincipal(user(90L, "ADMIN"))));
        assertFalse(student.isEnabled());
        verify(users).save(student);
    }

    @Test void rejectsRecruiterIdsAndAdminSelfTarget() {
        when(users.findById(41L)).thenReturn(Optional.of(user(41L, "RECRUITER")));
        assertThrows(ResponseStatusException.class, () -> service.setEnabled(41L, false, new UserPrincipal(user(90L, "ADMIN"))));
        assertThrows(ResponseStatusException.class, () -> service.setEnabled(90L, false, new UserPrincipal(user(90L, "ADMIN"))));
        verify(users, never()).save(any(User.class));
    }

    @Test void userPrincipalDisablesAuthenticationWhenStudentAccountIsInactive() {
        User student = user(41L, "STUDENT");
        student.setEnabled(false);
        assertFalse(new UserPrincipal(student).isEnabled());
    }

    private User user(Long id, String role) {
        User user = new User("Test", "test" + id + "@example.test", "not-a-real-password", role);
        try {
            var idField = User.class.getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(user, id);
        } catch (ReflectiveOperationException error) { throw new AssertionError(error); }
        return user;
    }
}
