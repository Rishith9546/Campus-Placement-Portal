package com.telusko.placement_portal.repository;

import com.telusko.placement_portal.entity.Job;
import com.telusko.placement_portal.dto.RecruiterJobCountProjection;
import com.telusko.placement_portal.dto.AdminJobProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface JobRepo extends JpaRepository<Job, Long> {
    java.util.Optional<Job> findByIdAndRecruiterId(Long id, Long recruiterId);
    List<Job> findTop3ByRecruiterIdOrderByCreatedAtDesc(Long recruiterId);
    List<Job> findTop10ByRecruiterIdOrderByCreatedAtDesc(Long recruiterId);

    List<Job> findByRecruiterId(Long recruiterId);

    long countByRecruiterId(Long recruiterId);
    long countByRecruiterIdAndDeadlineIsNull(Long recruiterId);
    long countByRecruiterIdAndDeadlineGreaterThanEqual(Long recruiterId, LocalDate deadline);
    long countByRecruiterIdAndDeadlineLessThan(Long recruiterId, LocalDate deadline);
    long countByDeadlineGreaterThanEqual(LocalDate deadline);
    long countByDeadlineLessThan(LocalDate deadline);
    List<Job> findTop8ByCreatedAtIsNotNullOrderByCreatedAtDesc();
    long countByApprovalStatusIgnoreCase(String approvalStatus);
    long countByClosedTrue();
    long countByDeadlineBefore(LocalDate deadline);
    long countByModerationFlaggedTrue();

    @Query("select count(j) from Job j where upper(coalesce(j.approvalStatus, 'APPROVED')) = 'APPROVED' and j.closed = false and j.moderationFlagged = false and (j.deadline is null or j.deadline >= :today)")
    long countStudentVisibleJobs(@Param("today") LocalDate today);

    @Query("select count(j) from Job j where j.closed = false and j.deadline < :today")
    long countExpiredJobs(@Param("today") LocalDate today);

    @Query("select j from Job j where upper(coalesce(j.approvalStatus, 'APPROVED')) = 'APPROVED' and j.closed = false and j.moderationFlagged = false and (j.deadline is null or j.deadline >= :today)")
    List<Job> findStudentVisibleJobs(@Param("today") LocalDate today);

    @Query("select j from Job j where j.id = :id and upper(coalesce(j.approvalStatus, 'APPROVED')) = 'APPROVED' and j.closed = false and j.moderationFlagged = false and (j.deadline is null or j.deadline >= :today)")
    java.util.Optional<Job> findStudentVisibleJob(@Param("id") Long id, @Param("today") LocalDate today);

    @Query("select j from Job j where upper(coalesce(j.approvalStatus, 'APPROVED')) = 'APPROVED' and j.closed = false and j.moderationFlagged = false and (j.deadline is null or j.deadline >= :today) and (lower(coalesce(j.title, '')) like lower(concat('%', :keyword, '%')) or lower(coalesce(j.company, '')) like lower(concat('%', :keyword, '%')) or lower(coalesce(j.skills, '')) like lower(concat('%', :keyword, '%')) or lower(coalesce(j.location, '')) like lower(concat('%', :keyword, '%')) or lower(coalesce(j.jobType, '')) like lower(concat('%', :keyword, '%'))) ")
    List<Job> searchStudentVisibleJobs(@Param("keyword") String keyword, @Param("today") LocalDate today);

    @Query(value = """
            select j.id as id, j.title as title, j.company as company, j.location as location,
                   j.jobType as jobType, j.salary as salary, j.createdAt as createdAt, j.deadline as deadline,
                   j.approvalStatus as approvalStatus, j.closed as closed,
                   j.moderationFlagged as moderationFlagged, j.recruiterId as recruiterId,
                   u.name as recruiterName, u.email as recruiterEmail
            from Job j left join User u on u.id = j.recruiterId
            where (:search is null or lower(coalesce(j.title, '')) like lower(concat('%', :search, '%'))
                   or lower(coalesce(j.company, '')) like lower(concat('%', :search, '%'))
                   or lower(coalesce(j.location, '')) like lower(concat('%', :search, '%'))
                   or lower(coalesce(u.name, '')) like lower(concat('%', :search, '%')))
              and (:approvalStatus is null or upper(coalesce(j.approvalStatus, 'APPROVED')) = upper(:approvalStatus))
              and (:jobType is null or lower(coalesce(j.jobType, '')) = lower(:jobType))
              and (:location is null or lower(coalesce(j.location, '')) like lower(concat('%', :location, '%')))
              and (:company is null or lower(coalesce(j.company, '')) like lower(concat('%', :company, '%')))
              and (:postedFrom is null or j.createdAt >= :postedFrom)
              and (:postedTo is null or j.createdAt <= :postedTo)
              and (:deadlineFrom is null or j.deadline >= :deadlineFrom)
              and (:deadlineTo is null or j.deadline <= :deadlineTo)
              and (:jobStatus is null or
                   (:jobStatus = 'ACTIVE' and upper(coalesce(j.approvalStatus, 'APPROVED')) = 'APPROVED' and j.closed = false and j.moderationFlagged = false and (j.deadline is null or j.deadline >= :today)) or
                   (:jobStatus = 'CLOSED' and j.closed = true) or
                   (:jobStatus = 'EXPIRED' and j.closed = false and j.deadline < :today) or
                   (:jobStatus = 'PENDING' and upper(coalesce(j.approvalStatus, 'APPROVED')) = 'PENDING') or
                   (:jobStatus = 'APPROVED' and upper(coalesce(j.approvalStatus, 'APPROVED')) = 'APPROVED') or
                   (:jobStatus = 'REJECTED' and upper(coalesce(j.approvalStatus, 'APPROVED')) = 'REJECTED') or
                   (:jobStatus = 'FLAGGED' and j.moderationFlagged = true))
            """,
            countQuery = """
            select count(j) from Job j left join User u on u.id = j.recruiterId
            where (:search is null or lower(coalesce(j.title, '')) like lower(concat('%', :search, '%'))
                   or lower(coalesce(j.company, '')) like lower(concat('%', :search, '%'))
                   or lower(coalesce(j.location, '')) like lower(concat('%', :search, '%'))
                   or lower(coalesce(u.name, '')) like lower(concat('%', :search, '%')))
              and (:approvalStatus is null or upper(coalesce(j.approvalStatus, 'APPROVED')) = upper(:approvalStatus))
              and (:jobType is null or lower(coalesce(j.jobType, '')) = lower(:jobType))
              and (:location is null or lower(coalesce(j.location, '')) like lower(concat('%', :location, '%')))
              and (:company is null or lower(coalesce(j.company, '')) like lower(concat('%', :company, '%')))
              and (:postedFrom is null or j.createdAt >= :postedFrom)
              and (:postedTo is null or j.createdAt <= :postedTo)
              and (:deadlineFrom is null or j.deadline >= :deadlineFrom)
              and (:deadlineTo is null or j.deadline <= :deadlineTo)
              and (:jobStatus is null or
                   (:jobStatus = 'ACTIVE' and upper(coalesce(j.approvalStatus, 'APPROVED')) = 'APPROVED' and j.closed = false and j.moderationFlagged = false and (j.deadline is null or j.deadline >= :today)) or
                   (:jobStatus = 'CLOSED' and j.closed = true) or
                   (:jobStatus = 'EXPIRED' and j.closed = false and j.deadline < :today) or
                   (:jobStatus = 'PENDING' and upper(coalesce(j.approvalStatus, 'APPROVED')) = 'PENDING') or
                   (:jobStatus = 'APPROVED' and upper(coalesce(j.approvalStatus, 'APPROVED')) = 'APPROVED') or
                   (:jobStatus = 'REJECTED' and upper(coalesce(j.approvalStatus, 'APPROVED')) = 'REJECTED') or
                   (:jobStatus = 'FLAGGED' and j.moderationFlagged = true))
            """)
    Page<AdminJobProjection> searchAdminJobs(@Param("search") String search,
                                             @Param("approvalStatus") String approvalStatus,
                                             @Param("jobStatus") String jobStatus,
                                             @Param("jobType") String jobType,
                                             @Param("location") String location,
                                             @Param("company") String company,
                                             @Param("postedFrom") java.time.LocalDateTime postedFrom,
                                             @Param("postedTo") java.time.LocalDateTime postedTo,
                                             @Param("deadlineFrom") LocalDate deadlineFrom,
                                             @Param("deadlineTo") LocalDate deadlineTo,
                                             @Param("today") LocalDate today,
                                             Pageable pageable);

    @Query("select distinct trim(j.company) from Job j where j.company is not null and trim(j.company) <> '' order by trim(j.company)")
    List<String> findDistinctCompanies();

    @Query("select distinct trim(j.jobType) from Job j where j.jobType is not null and trim(j.jobType) <> '' order by trim(j.jobType)")
    List<String> findDistinctJobTypes();
    List<Job> findByRecruiterIdAndDeadlineGreaterThanEqual(
            Long recruiterId,
            LocalDate deadline
    );
    List<Job> findByRecruiterIdAndDeadlineLessThan(
            Long recruiterId,
            LocalDate deadline
    );

    @Query("""
    SELECT j FROM Job j
    WHERE j.recruiterId = :id
    AND (
        LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
        OR LOWER(j.skills) LIKE LOWER(CONCAT('%', :keyword, '%'))
        OR LOWER(j.location) LIKE LOWER(CONCAT('%', :keyword, '%'))
        OR LOWER(j.jobType) LIKE LOWER(CONCAT('%', :keyword, '%'))
    )
""")
    List<Job> searchJobsById(
            @Param("keyword") String keyword,
            @Param("id") Long id
    );

    @Query("""
    SELECT j FROM Job j
    WHERE LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
       OR LOWER(j.company) LIKE LOWER(CONCAT('%', :keyword, '%'))
       OR LOWER(j.skills) LIKE LOWER(CONCAT('%', :keyword, '%'))
       OR LOWER(j.location) LIKE LOWER(CONCAT('%', :keyword, '%'))
       OR LOWER(j.jobType) LIKE LOWER(CONCAT('%', :keyword, '%'))
""")
    List<Job> searchJobsForStudent(@Param("keyword") String keyword);

    @Query("select j.recruiterId as recruiterId, count(j) as jobCount from Job j where j.recruiterId in :recruiterIds group by j.recruiterId")
    List<RecruiterJobCountProjection> countByRecruiterIds(@Param("recruiterIds") List<Long> recruiterIds);

}
