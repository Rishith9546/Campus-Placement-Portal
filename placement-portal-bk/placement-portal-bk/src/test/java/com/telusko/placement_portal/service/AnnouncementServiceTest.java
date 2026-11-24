package com.telusko.placement_portal.service;

import com.telusko.placement_portal.dto.AnnouncementRequest;
import com.telusko.placement_portal.entity.Announcement;
import com.telusko.placement_portal.entity.User;
import com.telusko.placement_portal.repository.AnnouncementRepo;
import com.telusko.placement_portal.repository.StudentRepo;
import com.telusko.placement_portal.security.UserPrincipal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class AnnouncementServiceTest {
    AnnouncementRepo repo; StudentRepo students; AnnouncementService service;
    @BeforeEach void setup(){repo=mock(AnnouncementRepo.class);students=mock(StudentRepo.class);service=new AnnouncementService(repo,students);when(repo.save(any())).thenAnswer(x->x.getArgument(0));}
    @Test void newAnnouncementIsDraftAndPublishingUsesLifecycle(){
        when(students.findDistinctBranches()).thenReturn(List.of("CSE"));
        AnnouncementRequest request=new AnnouncementRequest("Drive", "Register this week", "BRANCH", "CSE", "IMPORTANT", null, LocalDateTime.now().plusDays(2));
        assertEquals("DRAFT",service.create(request,4L).status());
        Announcement a=new Announcement();a.setId(10L);a.setStatus("DRAFT");a.setTitle("Drive");a.setAudience("BRANCH");a.setBranch("CSE");a.setPriority("IMPORTANT");a.setExpiresAt(LocalDateTime.now().plusDays(2));
        when(repo.findById(10L)).thenReturn(Optional.of(a));
        assertEquals("PUBLISHED",service.publish(10L).status());
        assertThrows(ResponseStatusException.class,()->service.publish(10L));
        assertEquals("UNPUBLISHED",service.unpublish(10L).status());
        assertEquals("ARCHIVED",service.archive(10L).status());
    }
    @Test void branchAudienceMustMatchSavedStudentBranch(){
        when(students.findDistinctBranches()).thenReturn(List.of("CSE"));
        AnnouncementRequest bad=new AnnouncementRequest("Drive","Body","BRANCH","ECE","NORMAL",null,null);
        assertEquals(HttpStatus.BAD_REQUEST,assertThrows(ResponseStatusException.class,()->service.create(bad,1L)).getStatusCode());
    }
    @Test void feedQueryUsesRoleAndProfileBranch(){
        User student=new User("A","a@x.test","x","STUDENT");org.springframework.test.util.ReflectionTestUtils.setField(student,"id",7L);
        com.telusko.placement_portal.entity.Student profile=new com.telusko.placement_portal.entity.Student();profile.setBranch("CSE");
        when(students.findById(7L)).thenReturn(Optional.of(profile));when(repo.visibleTo(eq("STUDENTS"),eq("CSE"),any(),any(Pageable.class))).thenReturn(List.of());
        assertTrue(service.feed(new UserPrincipal(student)).isEmpty());
        verify(repo).visibleTo(eq("STUDENTS"),eq("CSE"),any(),any(Pageable.class));
    }
}
