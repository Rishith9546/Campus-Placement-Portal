package com.telusko.placement_portal.service;

import com.telusko.placement_portal.dto.DsaProblemRequest;
import com.telusko.placement_portal.dto.DsaProblemResponse;
import com.telusko.placement_portal.dto.DsaStatsResponse;
import com.telusko.placement_portal.dto.DsaTopicProgress;
import com.telusko.placement_portal.entity.DsaProblem;
import com.telusko.placement_portal.entity.DsaProblem.Difficulty;
import com.telusko.placement_portal.entity.DsaProblem.ProblemStatus;
import com.telusko.placement_portal.entity.DsaProblem.Topic;
import com.telusko.placement_portal.entity.Student;
import com.telusko.placement_portal.repository.DsaProblemRepository;
import com.telusko.placement_portal.repository.StudentRepo;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.text.Normalizer;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

@Service
public class DsaProblemService {
    public static final int SOLVED_BENCHMARK = 150;
    public static final int VOLUME_WEIGHT_PERCENT = 70;
    public static final int TOPIC_COVERAGE_WEIGHT_PERCENT = 30;

    private final DsaProblemRepository problems;
    private final StudentRepo students;

    public DsaProblemService(DsaProblemRepository problems, StudentRepo students) {
        this.problems = problems;
        this.students = students;
    }

    @Transactional(readOnly = true)
    public List<DsaProblemResponse> list(Long studentId) {
        return problems.findAllByStudent_IdOrderByUpdatedAtDesc(studentId).stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public DsaProblemResponse get(Long studentId, Long problemId) {
        return toResponse(findOwned(studentId, problemId));
    }

    @Transactional
    public DsaProblemResponse create(Long studentId, DsaProblemRequest request) {
        Student student = students.findById(studentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student profile was not found."));
        String dedupeKey = dedupeKey(request);
        if (problems.findByStudent_IdAndDedupeKey(studentId, dedupeKey).isPresent()) {
            throw duplicateProblem();
        }
        DsaProblem problem = new DsaProblem();
        problem.setStudent(student);
        apply(problem, request, dedupeKey);
        try {
            return toResponse(problems.saveAndFlush(problem));
        } catch (DataIntegrityViolationException error) {
            throw duplicateProblem();
        }
    }

    @Transactional
    public DsaProblemResponse update(Long studentId, Long problemId, DsaProblemRequest request) {
        DsaProblem problem = findOwned(studentId, problemId);
        String dedupeKey = dedupeKey(request);
        if (problems.findByStudent_IdAndDedupeKeyAndIdNot(studentId, dedupeKey, problemId).isPresent()) {
            throw duplicateProblem();
        }
        apply(problem, request, dedupeKey);
        try {
            return toResponse(problems.saveAndFlush(problem));
        } catch (DataIntegrityViolationException error) {
            throw duplicateProblem();
        }
    }

    @Transactional
    public void delete(Long studentId, Long problemId) {
        problems.delete(findOwned(studentId, problemId));
    }

    @Transactional(readOnly = true)
    public DsaStatsResponse stats(Long studentId) {
        List<DsaProblem> records = problems.findAllByStudent_IdOrderByUpdatedAtDesc(studentId);
        long solved = records.stream().filter(p -> p.getStatus() == ProblemStatus.SOLVED).count();
        long attempted = records.stream().filter(p -> p.getStatus() == ProblemStatus.ATTEMPTED).count();
        long inProgress = records.stream().filter(p -> p.getStatus() == ProblemStatus.IN_PROGRESS).count();
        long easySolved = countSolved(records, Difficulty.EASY);
        long mediumSolved = countSolved(records, Difficulty.MEDIUM);
        long hardSolved = countSolved(records, Difficulty.HARD);

        Map<String, Long> difficultyDistribution = new HashMap<>();
        for (Difficulty difficulty : Difficulty.values()) {
            difficultyDistribution.put(difficulty.name(), records.stream().filter(p -> p.getDifficulty() == difficulty).count());
        }

        Map<Topic, TopicCounts> grouped = new EnumMap<>(Topic.class);
        records.forEach(problem -> grouped.computeIfAbsent(problem.getTopic(), ignored -> new TopicCounts()).add(problem.getStatus()));
        List<DsaTopicProgress> topicProgress = grouped.entrySet().stream()
                .sorted(Comparator.comparing(entry -> entry.getKey().name()))
                .map(entry -> {
                    TopicCounts counts = entry.getValue();
                    int percentage = counts.total == 0 ? 0 : (int) Math.round(counts.solved * 100.0 / counts.total);
                    return new DsaTopicProgress(entry.getKey(), counts.total, counts.solved, counts.attempted, counts.inProgress, percentage);
                }).toList();

        int solvedBenchmarkProgress = (int) Math.round(Math.min(solved / (double) SOLVED_BENCHMARK, 1.0) * 100);
        long solvedTopicCount = grouped.entrySet().stream().filter(entry -> entry.getValue().solved > 0).count();
        int topicCoverage = (int) Math.round(solvedTopicCount * 100.0 / Topic.values().length);
        // DSA score: 70% benchmark progress (150 unique solved problems) +
        // 30% topic coverage (topics with at least one solved problem).
        int dsaReadinessScore = solved == 0 ? 0 : Math.min(100, (int) Math.round(
                solvedBenchmarkProgress * (VOLUME_WEIGHT_PERCENT / 100.0)
                        + topicCoverage * (TOPIC_COVERAGE_WEIGHT_PERCENT / 100.0)));

        List<DsaProblemResponse> recentActivity = records.stream().limit(6).map(this::toResponse).toList();
        return new DsaStatsResponse(records.size(), solved, attempted, inProgress, easySolved, mediumSolved, hardSolved,
                difficultyDistribution, solvedBenchmarkProgress, dsaReadinessScore, SOLVED_BENCHMARK,
                topicCoverage, solvedTopicCount, Topic.values().length, topicProgress, recentActivity);
    }

    private long countSolved(List<DsaProblem> records, Difficulty difficulty) {
        return records.stream().filter(p -> p.getStatus() == ProblemStatus.SOLVED && p.getDifficulty() == difficulty).count();
    }

    private DsaProblem findOwned(Long studentId, Long problemId) {
        return problems.findByIdAndStudent_Id(problemId, studentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Coding problem was not found."));
    }

    private void apply(DsaProblem problem, DsaProblemRequest request, String dedupeKey) {
        String title = request.title().trim();
        String url = clean(request.problemUrl());
        validateUrl(url);
        if (request.status() == ProblemStatus.SOLVED && request.solvedAt() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Date solved is required when status is Solved.");
        }
        if (request.status() == ProblemStatus.SOLVED && request.solvedAt().isAfter(LocalDate.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Date solved cannot be in the future.");
        }
        problem.setTitle(title);
        problem.setProblemUrl(url);
        problem.setPlatform(request.platform());
        problem.setTopic(request.topic());
        problem.setDifficulty(request.difficulty());
        problem.setStatus(request.status());
        problem.setSolvedAt(request.status() == ProblemStatus.SOLVED ? request.solvedAt() : null);
        problem.setNotes(clean(request.notes()));
        problem.setTimeComplexity(clean(request.timeComplexity()));
        problem.setSpaceComplexity(clean(request.spaceComplexity()));
        problem.setDedupeKey(dedupeKey);
    }

    private String dedupeKey(DsaProblemRequest request) {
        String url = clean(request.problemUrl());
        if (url != null) return hashedKey("url:" + normalizeUrl(url));
        String title = Normalizer.normalize(request.title().trim(), Normalizer.Form.NFKC)
                .toLowerCase(Locale.ROOT).replaceAll("\\s+", " ");
        return hashedKey("title:" + request.platform().name() + ":" + title);
    }

    private String hashedKey(String value) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(value.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            return "sha256:" + HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException error) {
            throw new IllegalStateException("SHA-256 is unavailable", error);
        }
    }

    private String normalizeUrl(String value) {
        try {
            URI uri = URI.create(value.trim()).normalize();
            if (!uri.isAbsolute() || uri.getHost() == null
                    || !("http".equalsIgnoreCase(uri.getScheme()) || "https".equalsIgnoreCase(uri.getScheme()))) {
                throw new IllegalArgumentException();
            }
            String path = uri.getRawPath() == null ? "" : uri.getRawPath().replaceAll("/$", "");
            String query = uri.getRawQuery() == null ? "" : "?" + uri.getRawQuery();
            String port = uri.getPort() < 0 ? "" : ":" + uri.getPort();
            return uri.getScheme().toLowerCase(Locale.ROOT) + "://" + uri.getHost().toLowerCase(Locale.ROOT) + port + path + query;
        } catch (IllegalArgumentException error) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Problem URL must be a valid http or https link.");
        }
    }

    private void validateUrl(String value) { if (value != null) normalizeUrl(value); }
    private String clean(String value) { return value == null || value.isBlank() ? null : value.trim(); }
    private ResponseStatusException duplicateProblem() {
        return new ResponseStatusException(HttpStatus.CONFLICT, "This problem is already in your tracker. Update the existing record instead.");
    }

    private DsaProblemResponse toResponse(DsaProblem problem) {
        return new DsaProblemResponse(problem.getId(), problem.getTitle(), problem.getProblemUrl(), problem.getPlatform(),
                problem.getTopic(), problem.getDifficulty(), problem.getStatus(), problem.getSolvedAt(), problem.getNotes(),
                problem.getTimeComplexity(), problem.getSpaceComplexity(), problem.getCreatedAt(), problem.getUpdatedAt());
    }

    private static class TopicCounts {
        private long total;
        private long solved;
        private long attempted;
        private long inProgress;
        private void add(ProblemStatus status) {
            total++;
            if (status == ProblemStatus.SOLVED) solved++;
            else if (status == ProblemStatus.ATTEMPTED) attempted++;
            else inProgress++;
        }
    }
}
