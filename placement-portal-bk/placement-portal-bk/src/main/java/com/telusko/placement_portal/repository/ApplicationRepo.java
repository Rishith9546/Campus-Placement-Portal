package com.telusko.placement_portal.repository;

import com.telusko.placement_portal.entity.application;
import com.telusko.placement_portal.dto.JobApplicationCountProjection;
import com.telusko.placement_portal.dto.AdminApplicationProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepo extends JpaRepository<application, Long> {

    // Get applications of a particular student
    List<application> findByStudentId(Long studentId);
    List<application> findByStudentIdOrderByAppliedAtDescIdDesc(Long studentId);
    long countByStudentId(Long studentId);
    long countByStudentIdAndStatusIgnoreCase(Long studentId, String status);

    @Query("select coalesce(upper(a.status), 'APPLIED'), count(a) from application a where a.studentId = :studentId group by coalesce(upper(a.status), 'APPLIED')")
    List<Object[]> countStatusesByStudentId(@Param("studentId") Long studentId);

    // Get applications for a particular job
    List<application> findByJobId(Long jobId);
    List<application> findByJobIdOrderByAppliedAtAscIdAsc(Long jobId);
    java.util.Optional<application> findByIdAndJobId(Long id, Long jobId);
    List<application> findByJobIdInOrderByAppliedAtAscIdAsc(List<Long> jobIds);

    @Query("select a from application a where a.jobId = :jobId and a.id in :applicationIds")
    List<application> findForComparison(@Param("jobId") Long jobId, @Param("applicationIds") List<Long> applicationIds);

    // Check whether a student already applied for a particular job
    Optional<application> findByStudentIdAndJobId(
            Long studentId,
            Long jobId
    );

    // Count all applications for jobs posted by a recruiter
    @Query("""
        SELECT COUNT(a)
        FROM application a
        WHERE a.jobId IN (
            SELECT j.id
            FROM Job j
            WHERE j.recruiterId = :recruiterId
        )
    """)
    long countApplicationsByRecruiterId(
            @Param("recruiterId") Long recruiterId
    );

    @Query("select a.jobId as jobId, count(a) as applicationCount from application a where a.jobId in :jobIds group by a.jobId")
    List<JobApplicationCountProjection> countByJobIds(@Param("jobIds") List<Long> jobIds);

    @Query("select coalesce(upper(a.status), 'APPLIED'), count(a) from application a where a.jobId = :jobId group by coalesce(upper(a.status), 'APPLIED')")
    List<Object[]> countStatusesByJobId(@Param("jobId") Long jobId);

    // Count shortlisted applications for a recruiter
    @Query("""
        SELECT COUNT(a)
        FROM application a
        WHERE a.status = 'SHORTLISTED'
        AND a.jobId IN (
            SELECT j.id
            FROM Job j
            WHERE j.recruiterId = :recruiterId
        )
    """)
    long countShortlistedByRecruiterId(
            @Param("recruiterId") Long recruiterId
    );

    // Get shortlisted applications for a particular recruiter
    @Query("""
        SELECT a
        FROM application a
        WHERE a.status = 'SHORTLISTED'
        AND a.jobId IN (
            SELECT j.id
            FROM Job j
            WHERE j.recruiterId = :recruiterId
        )
    """)
    List<application> findShortlistedByRecruiterId(
            @Param("recruiterId") Long recruiterId
    );


    long countByJobId(int jobId);
    long countByStatusIgnoreCase(String status);
    List<application> findTop8ByAppliedAtIsNotNullOrderByAppliedAtDesc();

    @Query("select a.status, count(a) from application a group by a.status")
    List<Object[]> countGroupedByStatus();

    @Query(value = "select a.id as applicationId, a.studentId as studentId, coalesce(s.name, u.name) as studentName, coalesce(s.email, u.email) as studentEmail, s.rollNo as rollNo, s.branch as branch, s.cgpa as cgpa, s.skills as skills, a.jobId as jobId, j.title as jobTitle, j.company as company, j.location as location, j.jobType as jobType, j.salary as salary, j.deadline as deadline, j.recruiterId as recruiterId, r.name as recruiterName, a.appliedAt as appliedAt, coalesce(a.status, 'APPLIED') as status from application a left join Student s on s.id = a.studentId left join User u on u.id = a.studentId left join Job j on j.id = a.jobId left join User r on r.id = j.recruiterId where (:search is null or lower(coalesce(s.name,u.name,'')) like lower(concat('%',:search,'%')) or lower(coalesce(s.email,u.email,'')) like lower(concat('%',:search,'%')) or lower(coalesce(s.rollNo,'')) like lower(concat('%',:search,'%')) or lower(coalesce(j.title,'')) like lower(concat('%',:search,'%')) or lower(coalesce(j.company,'')) like lower(concat('%',:search,'%'))) and (:status is null or case when upper(coalesce(a.status,'APPLIED'))='PENDING' then 'APPLIED' else upper(coalesce(a.status,'APPLIED')) end=upper(:status)) and (:branch is null or lower(coalesce(s.branch,'')) like lower(concat('%',:branch,'%'))) and (:company is null or lower(coalesce(j.company,'')) like lower(concat('%',:company,'%'))) and (:jobId is null or a.jobId=:jobId) and (:startDate is null or a.appliedAt>=:startDate) and (:endDate is null or a.appliedAt<=:endDate)", countQuery = "select count(a) from application a left join Student s on s.id = a.studentId left join User u on u.id = a.studentId left join Job j on j.id = a.jobId where (:search is null or lower(coalesce(s.name,u.name,'')) like lower(concat('%',:search,'%')) or lower(coalesce(s.email,u.email,'')) like lower(concat('%',:search,'%')) or lower(coalesce(s.rollNo,'')) like lower(concat('%',:search,'%')) or lower(coalesce(j.title,'')) like lower(concat('%',:search,'%')) or lower(coalesce(j.company,'')) like lower(concat('%',:search,'%'))) and (:status is null or case when upper(coalesce(a.status,'APPLIED'))='PENDING' then 'APPLIED' else upper(coalesce(a.status,'APPLIED')) end=upper(:status)) and (:branch is null or lower(coalesce(s.branch,'')) like lower(concat('%',:branch,'%'))) and (:company is null or lower(coalesce(j.company,'')) like lower(concat('%',:company,'%'))) and (:jobId is null or a.jobId=:jobId) and (:startDate is null or a.appliedAt>=:startDate) and (:endDate is null or a.appliedAt<=:endDate)")
    Page<AdminApplicationProjection> searchAdminApplications(@Param("search") String search, @Param("status") String status, @Param("branch") String branch, @Param("company") String company, @Param("jobId") Long jobId, @Param("startDate") java.time.LocalDateTime startDate, @Param("endDate") java.time.LocalDateTime endDate, Pageable pageable);

    @Query("select count(distinct a.studentId) from application a where a.studentId is not null")
    long countUniqueApplyingStudents();
    long countByStudentIdIsNotNull();

    @Query("select case when upper(coalesce(a.status,'APPLIED'))='PENDING' then 'APPLIED' else upper(coalesce(a.status,'APPLIED')) end, count(a) from application a group by case when upper(coalesce(a.status,'APPLIED'))='PENDING' then 'APPLIED' else upper(coalesce(a.status,'APPLIED')) end")
    List<Object[]> countNormalizedStatuses();

    @Query("select s.branch, count(distinct s.id), count(distinct case when a.id is not null then s.id else null end), count(a), sum(case when upper(coalesce(a.status,'APPLIED'))='SHORTLISTED' then 1 else 0 end), sum(case when upper(coalesce(a.status,'APPLIED'))='SELECTED' then 1 else 0 end) from Student s left join application a on a.studentId=s.id where s.branch is not null and trim(s.branch)<>'' group by s.branch order by s.branch")
    List<Object[]> adminApplicationBranchStatistics();

    @Query("select j.company, count(distinct j.id), count(a), sum(case when upper(coalesce(a.status,'APPLIED'))='SHORTLISTED' then 1 else 0 end), sum(case when upper(coalesce(a.status,'APPLIED'))='SELECTED' then 1 else 0 end) from Job j left join application a on a.jobId=j.id where j.company is not null and trim(j.company)<>'' group by j.company order by j.company")
    List<Object[]> adminApplicationCompanyStatistics();

    List<application> findByJobIdAndStatus(Long jobId, String status);


}
