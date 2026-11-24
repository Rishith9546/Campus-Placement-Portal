package com.telusko.placement_portal.service;

import com.telusko.placement_portal.dto.RecruiterAnalyticsDto;
import com.telusko.placement_portal.entity.Job;
import com.telusko.placement_portal.entity.PipelineStage;
import com.telusko.placement_portal.entity.application;
import com.telusko.placement_portal.repository.ApplicationRepo;
import com.telusko.placement_portal.repository.JobRepo;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class RecruiterAnalyticsService {
    private static final DateTimeFormatter MONTH_FORMAT = DateTimeFormatter.ofPattern("MMM yyyy");
    private final JobRepo jobRepo;
    private final ApplicationRepo applicationRepo;

    public RecruiterAnalyticsService(JobRepo jobRepo, ApplicationRepo applicationRepo) {
        this.jobRepo = jobRepo;
        this.applicationRepo = applicationRepo;
    }

    public RecruiterAnalyticsDto getAnalytics(Long recruiterId) {
        List<Job> jobs = jobRepo.findByRecruiterId(recruiterId);
        List<Long> jobIds = jobs.stream().map(Job::getId).filter(Objects::nonNull).toList();
        List<application> applications = jobIds.isEmpty()
                ? List.of() : applicationRepo.findByJobIdInOrderByAppliedAtAscIdAsc(jobIds);
        LocalDate today = LocalDate.now();
        long active = jobs.stream().filter(job -> job.getDeadline() == null || !job.getDeadline().isBefore(today)).count();
        long closed = jobs.size() - active;
        Map<PipelineStage, Long> counts = counts(applications);

        Map<Long, List<application>> byJob = applications.stream()
                .collect(Collectors.groupingBy(application::getJobId));
        List<RecruiterAnalyticsDto.JobPerformance> performance = jobs.stream()
                .map(job -> jobPerformance(job, byJob.getOrDefault(job.getId(), List.of()), today))
                .sorted((a, b) -> Long.compare(b.applications(), a.applications()))
                .toList();

        YearMonth currentMonth = YearMonth.now();
        List<RecruiterAnalyticsDto.MonthlyApplications> monthly = new ArrayList<>();
        for (int offset = 5; offset >= 0; offset--) {
            YearMonth month = currentMonth.minusMonths(offset);
            long count = applications.stream().filter(app -> app.getAppliedAt() != null
                    && YearMonth.from(app.getAppliedAt()).equals(month)).count();
            monthly.add(new RecruiterAnalyticsDto.MonthlyApplications(MONTH_FORMAT.format(month), count));
        }

        return new RecruiterAnalyticsDto(jobs.size(), active, closed, applications.size(),
                counts.get(PipelineStage.APPLIED), counts.get(PipelineStage.UNDER_REVIEW),
                counts.get(PipelineStage.SHORTLISTED), counts.get(PipelineStage.INTERVIEW_SCHEDULED),
                counts.get(PipelineStage.INTERVIEWED), counts.get(PipelineStage.SELECTED),
                counts.get(PipelineStage.REJECTED), monthly, performance, false, LocalDateTime.now());
    }

    private Map<PipelineStage, Long> counts(List<application> applications) {
        Map<PipelineStage, Long> counts = new EnumMap<>(PipelineStage.class);
        for (PipelineStage stage : PipelineStage.values()) counts.put(stage, 0L);
        for (application app : applications) counts.merge(PipelineStage.parse(app.getStatus()), 1L, Long::sum);
        return counts;
    }

    private RecruiterAnalyticsDto.JobPerformance jobPerformance(Job job, List<application> applications, LocalDate today) {
        Map<PipelineStage, Long> counts = counts(applications);
        return new RecruiterAnalyticsDto.JobPerformance(job.getId(), job.getTitle(), job.getCompany(), job.getDeadline(),
                job.getDeadline() == null || !job.getDeadline().isBefore(today), applications.size(),
                counts.get(PipelineStage.UNDER_REVIEW), counts.get(PipelineStage.SHORTLISTED),
                counts.get(PipelineStage.INTERVIEW_SCHEDULED), counts.get(PipelineStage.INTERVIEWED),
                counts.get(PipelineStage.SELECTED), counts.get(PipelineStage.REJECTED));
    }
}
