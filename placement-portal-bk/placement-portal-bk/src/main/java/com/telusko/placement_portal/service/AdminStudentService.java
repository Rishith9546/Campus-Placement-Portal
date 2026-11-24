package com.telusko.placement_portal.service;

import com.telusko.placement_portal.dto.*;
import com.telusko.placement_portal.entity.*;
import com.telusko.placement_portal.repository.*;
import com.telusko.placement_portal.security.UserPrincipal;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminStudentService {
    private static final Set<String> SORT_FIELDS = Set.of("name", "email", "rollNo", "branch", "cgpa", "graduationYear", "enabled");
    private final UserRepository users;
    private final StudentRepo students;
    private final ApplicationRepo applications;
    private final JobRepo jobs;
    private final StudentProfileEntryRepository entries;

    public AdminStudentService(UserRepository users, StudentRepo students, ApplicationRepo applications,
                               JobRepo jobs, StudentProfileEntryRepository entries) {
        this.users = users;
        this.students = students;
        this.applications = applications;
        this.jobs = jobs;
        this.entries = entries;
    }

    @Transactional(readOnly = true)
    public AdminStudentPageDto list(int page, int size, String search, String branch, Double minCgpa,
                                    Double maxCgpa, String skill, String accountStatus,
                                    String sortBy, String sortDirection) {
        if (page < 0 || size < 1 || size > 100) throw badRequest("Page must be non-negative and size must be between 1 and 100.");
        if (minCgpa != null && (minCgpa < 0 || minCgpa > 10)) throw badRequest("Minimum CGPA must be between 0 and 10.");
        if (maxCgpa != null && (maxCgpa < 0 || maxCgpa > 10)) throw badRequest("Maximum CGPA must be between 0 and 10.");
        if (minCgpa != null && maxCgpa != null && minCgpa > maxCgpa) throw badRequest("Minimum CGPA cannot exceed maximum CGPA.");
        Boolean enabled = switch (accountStatus == null ? "" : accountStatus.trim().toUpperCase(Locale.ROOT)) {
            case "ACTIVE", "ENABLED" -> true;
            case "INACTIVE", "DISABLED" -> false;
            case "" , "ALL" -> null;
            default -> throw badRequest("Account status must be ACTIVE, INACTIVE, or ALL.");
        };
        String safeSort = sortBy == null || sortBy.isBlank() ? "name" : sortBy.trim();
        if (!SORT_FIELDS.contains(safeSort)) throw badRequest("Unsupported sort field.");
        Sort.Direction direction;
        try { direction = Sort.Direction.fromString(sortDirection == null ? "asc" : sortDirection); }
        catch (IllegalArgumentException ex) { throw badRequest("Sort direction must be asc or desc."); }

        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, safeSort).and(Sort.by(Sort.Direction.ASC, "id")));
        Page<AdminStudentProjection> result = users.searchAdminStudents(blankToNull(search), blankToNull(branch), minCgpa,
                maxCgpa, blankToNull(skill), enabled, pageable);
        List<AdminStudentListItem> content = result.getContent().stream().map(row -> new AdminStudentListItem(
                row.getId(), row.getName(), row.getEmail(), Boolean.TRUE.equals(row.getEnabled()), row.getRollNo(),
                row.getBranch(), row.getCgpa(), row.getSkills(), row.getProfilePhoto(), row.getGraduationYear())).toList();
        return new AdminStudentPageDto(content, result.getNumber(), result.getSize(), result.getTotalElements(),
                result.getTotalPages(), users.countByRole("STUDENT"));
    }

    @Transactional(readOnly = true)
    public List<String> branches() { return students.findDistinctBranches(); }

    @Transactional(readOnly = true)
    public AdminStudentProfileDto profile(Long id) {
        User user = requireStudent(id);
        Student profile = students.findById(id).orElse(null);
        Map<String, Long> counts = statusCounts(id);
        List<AdminStudentProfileDto.ProfileEntry> careerEntries = entries.findAllByStudent_IdOrderByIdDesc(id).stream()
                .map(entry -> new AdminStudentProfileDto.ProfileEntry(entry.getType().name(), entry.getTitle(),
                        entry.getOrganization(), entry.getRole(), entry.getDescription(), entry.getTechnologies(),
                        entry.getRepositoryUrl(), entry.getLiveUrl(), entry.getCredentialUrl(), entry.getStartDate(),
                        entry.getEndDate(), entry.getIssueDate())).toList();
        return new AdminStudentProfileDto(id, user.getName(), user.getEmail(), user.isEnabled(),
                profile == null ? null : profile.getPhone(), profile == null ? null : profile.getRollNo(),
                profile == null ? null : profile.getBranch(), profile == null ? null : profile.getCgpa(),
                profile == null ? null : profile.getSkills(), profile == null ? null : profile.getProfilePhoto(),
                profile != null && profile.getResume() != null && !profile.getResume().isBlank(),
                profile == null ? null : profile.getCollegeName(), profile == null ? null : profile.getDegree(),
                profile == null ? null : profile.getGraduationYear(), profile == null ? null : profile.getBacklogs(),
                profile == null ? null : profile.getGithubProfile(), profile == null ? null : profile.getLinkedInProfile(),
                profile == null ? null : profile.getPortfolioUrl(), counts.values().stream().mapToLong(Long::longValue).sum(),
                counts.getOrDefault("SHORTLISTED", 0L), counts.getOrDefault("REJECTED", 0L),
                counts.getOrDefault("SELECTED", 0L), careerEntries);
    }

    @Transactional(readOnly = true)
    public List<AdminStudentApplicationDto> applications(Long id) {
        requireStudent(id);
        List<com.telusko.placement_portal.entity.application> records = applications.findByStudentIdOrderByAppliedAtDescIdDesc(id);
        Map<Long, Job> jobById = jobs.findAllById(records.stream().map(com.telusko.placement_portal.entity.application::getJobId)
                        .filter(Objects::nonNull).distinct().toList()).stream()
                .collect(Collectors.toMap(Job::getId, job -> job));
        return records.stream().map(app -> {
            Job job = jobById.get(app.getJobId());
            String status = app.getStatus() == null || app.getStatus().isBlank() ? "APPLIED" : app.getStatus();
            return new AdminStudentApplicationDto(app.getId(), app.getJobId(), job == null ? null : job.getTitle(),
                    job == null ? null : job.getCompany(), status, app.getAppliedAt(), job == null ? null : job.getDeadline());
        }).toList();
    }

    @Transactional
    public boolean setEnabled(Long id, boolean enabled, UserPrincipal admin) {
        if (admin != null && Objects.equals(admin.getId(), id)) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot change your own account from student management.");
        User user = requireStudent(id);
        user.setEnabled(enabled);
        users.save(user);
        return user.isEnabled();
    }

    @Transactional(readOnly = true)
    public Resource resume(Long id) {
        requireStudent(id);
        Student profile = students.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student profile not found."));
        String storedName = profile.getResume();
        if (storedName == null || storedName.isBlank()) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "This student has no saved resume.");
        Path fileName;
        try { fileName = Paths.get(storedName).getFileName(); }
        catch (RuntimeException ex) { throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Saved resume is unavailable."); }
        if (fileName == null || !fileName.toString().equals(storedName) || !storedName.toLowerCase(Locale.ROOT).endsWith(".pdf")) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Saved resume is unavailable.");
        }
        Path directory = Paths.get("uploads", "resume").toAbsolutePath().normalize();
        Path path = directory.resolve(fileName).normalize();
        if (!path.startsWith(directory) || !Files.isRegularFile(path)) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Saved resume is unavailable.");
        return new FileSystemResource(path);
    }

    private User requireStudent(Long id) {
        User user = users.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found."));
        if (!"STUDENT".equalsIgnoreCase(user.getRole())) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found.");
        return user;
    }

    private Map<String, Long> statusCounts(Long studentId) {
        Map<String, Long> counts = new HashMap<>();
        for (Object[] row : applications.countStatusesByStudentId(studentId)) counts.put(String.valueOf(row[0]), ((Number) row[1]).longValue());
        return counts;
    }

    private String blankToNull(String value) { return value == null || value.isBlank() ? null : value.trim(); }
    private ResponseStatusException badRequest(String message) { return new ResponseStatusException(HttpStatus.BAD_REQUEST, message); }
}
