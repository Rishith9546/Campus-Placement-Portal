package com.telusko.placement_portal.repository;

import com.telusko.placement_portal.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;
import com.telusko.placement_portal.dto.AdminStudentProjection;
import com.telusko.placement_portal.dto.AdminRecruiterProjection;

import java.util.Optional;
import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    long countByRole(String role);
    long countByRoleIgnoreCase(String role);
    long countByRoleIgnoreCaseAndEnabledTrue(String role);
    long countByRoleIgnoreCaseAndEnabledFalse(String role);

    @Query("select count(distinct u.companyName) from User u where upper(u.role) = 'RECRUITER' and u.companyName is not null and trim(u.companyName) <> ''")
    long countRecruiterCompanies();

    @Query(value = """
            select u.id as id, u.name as name, u.email as email, u.enabled as enabled,
                   s.rollNo as rollNo, s.branch as branch, s.cgpa as cgpa, s.skills as skills,
                   s.profilePhoto as profilePhoto, s.graduationYear as graduationYear
            from User u left join Student s on s.id = u.id
            where upper(u.role) = 'STUDENT'
              and (:search is null or lower(coalesce(u.name, '')) like lower(concat('%', :search, '%'))
                   or lower(coalesce(u.email, '')) like lower(concat('%', :search, '%'))
                   or lower(coalesce(s.rollNo, '')) like lower(concat('%', :search, '%'))
                   or lower(coalesce(s.branch, '')) like lower(concat('%', :search, '%')))
              and (:branch is null or lower(trim(s.branch)) = lower(trim(:branch)))
              and (:minCgpa is null or s.cgpa >= :minCgpa)
              and (:maxCgpa is null or s.cgpa <= :maxCgpa)
              and (:skill is null or lower(coalesce(s.skills, '')) like lower(concat('%', :skill, '%')))
              and (:enabled is null or u.enabled = :enabled)
            """,
            countQuery = """
            select count(u)
            from User u left join Student s on s.id = u.id
            where upper(u.role) = 'STUDENT'
              and (:search is null or lower(coalesce(u.name, '')) like lower(concat('%', :search, '%'))
                   or lower(coalesce(u.email, '')) like lower(concat('%', :search, '%'))
                   or lower(coalesce(s.rollNo, '')) like lower(concat('%', :search, '%'))
                   or lower(coalesce(s.branch, '')) like lower(concat('%', :search, '%')))
              and (:branch is null or lower(trim(s.branch)) = lower(trim(:branch)))
              and (:minCgpa is null or s.cgpa >= :minCgpa)
              and (:maxCgpa is null or s.cgpa <= :maxCgpa)
              and (:skill is null or lower(coalesce(s.skills, '')) like lower(concat('%', :skill, '%')))
              and (:enabled is null or u.enabled = :enabled)
            """)
    Page<AdminStudentProjection> searchAdminStudents(@Param("search") String search,
                                                     @Param("branch") String branch,
                                                     @Param("minCgpa") Double minCgpa,
                                                     @Param("maxCgpa") Double maxCgpa,
                                                     @Param("skill") String skill,
                                                     @Param("enabled") Boolean enabled,
                                                     Pageable pageable);

    long countByRoleAndVerificationStatusIgnoreCase(String role, String verificationStatus);
    long countByRoleAndEnabled(String role, boolean enabled);

    @Query(value = """
            select u.id as id, u.name as name, u.email as email, u.companyName as companyName,
                   u.enabled as enabled, coalesce(u.verificationStatus, 'PENDING') as verificationStatus
            from User u
            where upper(u.role) = 'RECRUITER'
              and (:search is null or lower(coalesce(u.name, '')) like lower(concat('%', :search, '%'))
                   or lower(coalesce(u.email, '')) like lower(concat('%', :search, '%'))
                   or lower(coalesce(u.companyName, '')) like lower(concat('%', :search, '%')))
              and (:company is null or lower(trim(u.companyName)) = lower(trim(:company)))
              and (:verificationStatus is null or upper(coalesce(u.verificationStatus, 'PENDING')) = upper(:verificationStatus))
              and (:enabled is null or u.enabled = :enabled)
            """,
            countQuery = """
            select count(u) from User u
            where upper(u.role) = 'RECRUITER'
              and (:search is null or lower(coalesce(u.name, '')) like lower(concat('%', :search, '%'))
                   or lower(coalesce(u.email, '')) like lower(concat('%', :search, '%'))
                   or lower(coalesce(u.companyName, '')) like lower(concat('%', :search, '%')))
              and (:company is null or lower(trim(u.companyName)) = lower(trim(:company)))
              and (:verificationStatus is null or upper(coalesce(u.verificationStatus, 'PENDING')) = upper(:verificationStatus))
              and (:enabled is null or u.enabled = :enabled)
            """)
    Page<AdminRecruiterProjection> searchAdminRecruiters(@Param("search") String search,
                                                          @Param("company") String company,
                                                          @Param("verificationStatus") String verificationStatus,
                                                          @Param("enabled") Boolean enabled,
                                                          Pageable pageable);

    @Query("select distinct trim(u.companyName) from User u where upper(u.role) = 'RECRUITER' and u.companyName is not null and trim(u.companyName) <> '' order by trim(u.companyName)")
    List<String> findDistinctRecruiterCompanies();
}
