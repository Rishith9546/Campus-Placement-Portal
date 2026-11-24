package com.telusko.placement_portal.service;

import com.telusko.placement_portal.entity.*;
import com.telusko.placement_portal.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class CandidateComparisonServiceTest {
    private JobRepo jobs;
    private ApplicationRepo applications;
    private StudentRepo students;
    private StudentProfileEntryRepository entries;
    private CandidateComparisonService service;
    private Job job;

    @BeforeEach void setUp() {
        jobs = mock(JobRepo.class); applications = mock(ApplicationRepo.class); students = mock(StudentRepo.class); entries = mock(StudentProfileEntryRepository.class);
        service = new CandidateComparisonService(jobs, applications, students, entries, new JobMatchService(jobs, students, applications));
        job = new Job(); job.setId(80L); job.setRecruiterId(8L); job.setTitle("Developer"); job.setSkills("Java, SQL"); job.setEligibility("All branches; minimum CGPA 7.0");
    }

    @Test void comparesSelectedApplicantsWithRealProfileAndMatchData() {
        application first = app(1L, 11L); application second = app(2L, 12L);
        Student s1 = student(11L, "Ravi", "Java", 8.0); Student s2 = student(12L, "Maya", "SQL", 7.5);
        StudentProfileEntry project = new StudentProfileEntry(); project.setStudent(s1); project.setType(StudentProfileEntry.EntryType.PROJECT); project.setTitle("Campus App"); project.setTechnologies("Java, MySQL");
        when(jobs.findByIdAndRecruiterId(80L, 8L)).thenReturn(Optional.of(job));
        when(applications.findForComparison(80L, List.of(1L, 2L))).thenReturn(List.of(first, second));
        when(students.findAllById(List.of(11L, 12L))).thenReturn(List.of(s1, s2));
        when(entries.findComparisonEntries(List.of(11L, 12L), List.of(StudentProfileEntry.EntryType.PROJECT, StudentProfileEntry.EntryType.EXPERIENCE))).thenReturn(List.of(project));

        var result = service.compare(8L, 80L, List.of(1L, 2L));

        assertEquals(List.of(1L, 2L), result.stream().map(x -> x.applicationId()).toList());
        assertEquals("Ravi", result.get(0).studentName());
        assertTrue(result.get(0).match().scoreAvailable());
        assertTrue(result.get(0).match().matchedSkills().contains("Java"));
        assertTrue(result.get(0).match().missingSkills().contains("SQL"));
        assertEquals("Campus App", result.get(0).projects().get(0).title());
        assertTrue(result.get(1).projects().isEmpty());
    }

    @Test void allowsFiveCandidatesAndKeepsMissingAcademicDataUnavailable() {
        List<Long> ids = List.of(1L, 2L, 3L, 4L, 5L);
        List<application> selected = List.of(app(1L, 11L), app(2L, 12L), app(3L, 13L), app(4L, 14L), app(5L, 15L));
        Student missingAcademics = student(11L, "Ravi", "", 0.0); missingAcademics.setCgpa(null); missingAcademics.setBranch(null);
        when(jobs.findByIdAndRecruiterId(80L, 8L)).thenReturn(Optional.of(job));
        when(applications.findForComparison(80L, ids)).thenReturn(selected);
        when(students.findAllById(List.of(11L, 12L, 13L, 14L, 15L))).thenReturn(List.of(missingAcademics, student(12L, "B", "Java", 8), student(13L, "C", "SQL", 8), student(14L, "D", "Java", 8), student(15L, "E", "SQL", 8)));
        when(entries.findComparisonEntries(anyCollection(), anyCollection())).thenReturn(List.of());
        var result = service.compare(8L, 80L, ids);
        assertEquals(5, result.size());
        assertNull(result.get(0).cgpa()); assertNull(result.get(0).branch());
        assertEquals("NEEDS_REVIEW", result.get(0).match().eligibilityStatus());
    }

    @Test void enforcesTwoToFiveUniqueApplications() {
        assertEquals(HttpStatus.BAD_REQUEST, assertThrows(ResponseStatusException.class, () -> service.compare(8L, 80L, List.of(1L))).getStatusCode());
        assertEquals(HttpStatus.BAD_REQUEST, assertThrows(ResponseStatusException.class, () -> service.compare(8L, 80L, List.of(1L, 2L, 3L, 4L, 5L, 6L))).getStatusCode());
        assertEquals(HttpStatus.BAD_REQUEST, assertThrows(ResponseStatusException.class, () -> service.compare(8L, 80L, List.of(1L, 1L))).getStatusCode());
        verify(jobs, never()).findByIdAndRecruiterId(anyLong(), anyLong());
    }

    @Test void requiresOwnedJobAndEveryApplicationToBelongToThatJob() {
        when(jobs.findByIdAndRecruiterId(80L, 9L)).thenReturn(Optional.empty());
        assertEquals(HttpStatus.NOT_FOUND, assertThrows(ResponseStatusException.class, () -> service.compare(9L, 80L, List.of(1L, 2L))).getStatusCode());
        when(jobs.findByIdAndRecruiterId(80L, 8L)).thenReturn(Optional.of(job));
        when(applications.findForComparison(80L, List.of(1L, 2L))).thenReturn(List.of(app(1L, 11L)));
        assertEquals(HttpStatus.NOT_FOUND, assertThrows(ResponseStatusException.class, () -> service.compare(8L, 80L, List.of(1L, 2L))).getStatusCode());
    }

    @Test void doesNotExposeHiddenStudentProfiles() {
        Student hidden = student(11L, "Hidden", "Java", 8.0); hidden.setProfileVisible(false);
        when(jobs.findByIdAndRecruiterId(80L, 8L)).thenReturn(Optional.of(job));
        when(applications.findForComparison(80L, List.of(1L, 2L))).thenReturn(List.of(app(1L, 11L), app(2L, 12L)));
        when(students.findAllById(List.of(11L, 12L))).thenReturn(List.of(hidden, student(12L, "Visible", "SQL", 8.0)));
        assertEquals(HttpStatus.NOT_FOUND, assertThrows(ResponseStatusException.class, () -> service.compare(8L, 80L, List.of(1L, 2L))).getStatusCode());
    }

    private application app(Long id, Long studentId) { application a = new application(); a.setId(id); a.setJobId(80L); a.setStudentId(studentId); a.setStatus("APPLIED"); return a; }
    private Student student(Long id, String name, String skills, double cgpa) { Student s = new Student(); s.setId(id); s.setName(name); s.setSkills(skills); s.setCgpa(cgpa); s.setBranch("CSE"); s.setProfileVisible(true); return s; }
}
