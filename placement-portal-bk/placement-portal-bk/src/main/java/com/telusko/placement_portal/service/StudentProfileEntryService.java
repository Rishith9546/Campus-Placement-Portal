package com.telusko.placement_portal.service;

import com.telusko.placement_portal.dto.StudentProfileEntryRequest;
import com.telusko.placement_portal.dto.StudentProfileEntryResponse;
import com.telusko.placement_portal.entity.Student;
import com.telusko.placement_portal.entity.StudentProfileEntry;
import com.telusko.placement_portal.entity.StudentProfileEntry.EntryType;
import com.telusko.placement_portal.repository.StudentProfileEntryRepository;
import com.telusko.placement_portal.repository.StudentRepo;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.util.List;

@Service
public class StudentProfileEntryService {
    private final StudentProfileEntryRepository entries;
    private final StudentRepo students;

    public StudentProfileEntryService(StudentProfileEntryRepository entries, StudentRepo students) {
        this.entries = entries;
        this.students = students;
    }

    @Transactional(readOnly = true)
    public List<StudentProfileEntryResponse> list(Long studentId) {
        return entries.findAllByStudent_IdOrderByIdDesc(studentId).stream().map(this::response).toList();
    }

    @Transactional
    public StudentProfileEntryResponse create(Long studentId, StudentProfileEntryRequest request) {
        Student student = students.findById(studentId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student profile not found"));
        StudentProfileEntry entry = new StudentProfileEntry();
        entry.setStudent(student);
        apply(entry, request);
        return response(entries.save(entry));
    }

    @Transactional
    public StudentProfileEntryResponse update(Long studentId, Long entryId, StudentProfileEntryRequest request) {
        StudentProfileEntry entry = entries.findByIdAndStudent_Id(entryId, studentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile entry not found"));
        apply(entry, request);
        return response(entries.save(entry));
    }

    @Transactional
    public void delete(Long studentId, Long entryId) {
        StudentProfileEntry entry = entries.findByIdAndStudent_Id(entryId, studentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile entry not found"));
        entries.delete(entry);
    }

    private void apply(StudentProfileEntry entry, StudentProfileEntryRequest request) {
        EntryType type = request.type();
        if (type == EntryType.CERTIFICATION && (request.organization() == null || request.organization().isBlank())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Issuing organization is required for a certification.");
        }
        if (type == EntryType.EXPERIENCE && (request.organization() == null || request.organization().isBlank() || request.role() == null || request.role().isBlank())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Company and role are required for experience.");
        }
        if (request.startDate() != null && request.endDate() != null && request.endDate().isBefore(request.startDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "End date must be after the start date.");
        }
        validateUrl(request.repositoryUrl());
        validateUrl(request.liveUrl());
        validateUrl(request.credentialUrl());
        entry.setType(type);
        entry.setTitle(request.title().trim());
        entry.setOrganization(clean(request.organization()));
        entry.setRole(clean(request.role()));
        entry.setDescription(clean(request.description()));
        entry.setTechnologies(clean(request.technologies()));
        entry.setRepositoryUrl(clean(request.repositoryUrl()));
        entry.setLiveUrl(clean(request.liveUrl()));
        entry.setCredentialUrl(clean(request.credentialUrl()));
        entry.setStartDate(request.startDate());
        entry.setEndDate(request.endDate());
        entry.setIssueDate(request.issueDate());
    }

    private void validateUrl(String value) {
        if (value == null || value.isBlank()) return;
        try {
            URI uri = URI.create(value.trim());
            if (!uri.isAbsolute() || !("https".equalsIgnoreCase(uri.getScheme()) || "http".equalsIgnoreCase(uri.getScheme())) || uri.getHost() == null) throw new IllegalArgumentException();
        } catch (IllegalArgumentException error) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Links must be valid http or https URLs.");
        }
    }

    private String clean(String value) { return value == null || value.isBlank() ? null : value.trim(); }

    private StudentProfileEntryResponse response(StudentProfileEntry entry) {
        return new StudentProfileEntryResponse(entry.getId(), entry.getType(), entry.getTitle(), entry.getOrganization(), entry.getRole(), entry.getDescription(), entry.getTechnologies(), entry.getRepositoryUrl(), entry.getLiveUrl(), entry.getCredentialUrl(), entry.getStartDate(), entry.getEndDate(), entry.getIssueDate());
    }
}
