package com.telusko.placement_portal.repository;

import com.telusko.placement_portal.entity.Announcement;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface AnnouncementRepo extends JpaRepository<Announcement,Long> {
    @Query(value="select a from Announcement a where (:search is null or lower(a.title) like lower(concat('%',:search,'%')) or lower(a.content) like lower(concat('%',:search,'%'))) and (:audience is null or a.audience=:audience) and (:status is null or a.status=:status) and (:priority is null or a.priority=:priority)",countQuery="select count(a) from Announcement a where (:search is null or lower(a.title) like lower(concat('%',:search,'%')) or lower(a.content) like lower(concat('%',:search,'%'))) and (:audience is null or a.audience=:audience) and (:status is null or a.status=:status) and (:priority is null or a.priority=:priority)")
    Page<Announcement> searchAdmin(@Param("search") String search,@Param("audience") String audience,@Param("status") String status,@Param("priority") String priority,Pageable pageable);
    @Query("select a from Announcement a where a.status='PUBLISHED' and (a.publishAt is null or a.publishAt<=:now) and (a.expiresAt is null or a.expiresAt>:now) and (a.audience='ALL' or a.audience=:role or (:branch is not null and a.audience='BRANCH' and lower(trim(a.branch))=lower(trim(:branch)))) order by case a.priority when 'URGENT' then 0 when 'IMPORTANT' then 1 else 2 end, a.publishAt desc, a.createdAt desc")
    List<Announcement> visibleTo(@Param("role") String role,@Param("branch") String branch,@Param("now") LocalDateTime now,Pageable pageable);
    @Query("select a from Announcement a where a.id=:id and a.status='PUBLISHED' and (a.publishAt is null or a.publishAt<=:now) and (a.expiresAt is null or a.expiresAt>:now) and (a.audience='ALL' or a.audience=:role or (:branch is not null and a.audience='BRANCH' and lower(trim(a.branch))=lower(trim(:branch))))")
    Optional<Announcement> visibleById(@Param("id") Long id,@Param("role") String role,@Param("branch") String branch,@Param("now") LocalDateTime now);
}
