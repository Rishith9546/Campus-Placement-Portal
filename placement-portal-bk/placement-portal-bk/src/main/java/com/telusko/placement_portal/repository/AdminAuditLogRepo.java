package com.telusko.placement_portal.repository;
import com.telusko.placement_portal.entity.AdminAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.*;
public interface AdminAuditLogRepo extends JpaRepository<AdminAuditLog,Long> {
 @Query("select a from AdminAuditLog a where (:search is null or lower(a.adminEmail) like lower(concat('%',:search,'%')) or lower(a.entityType) like lower(concat('%',:search,'%')) or lower(a.action) like lower(concat('%',:search,'%')) or lower(a.description) like lower(concat('%',:search,'%'))) and (:action is null or a.action=:action) and (:entity is null or a.entityType=:entity) and (:from is null or a.createdAt>=:from) and (:to is null or a.createdAt<=:to)")
 Page<AdminAuditLog> search(@Param("search") String search,@Param("action") String action,@Param("entity") String entity,@Param("from") java.time.LocalDateTime from,@Param("to") java.time.LocalDateTime to,Pageable pageable);
}
