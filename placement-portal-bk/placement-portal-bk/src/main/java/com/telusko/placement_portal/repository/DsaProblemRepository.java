package com.telusko.placement_portal.repository;

import com.telusko.placement_portal.entity.DsaProblem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface DsaProblemRepository extends JpaRepository<DsaProblem, Long> {
    List<DsaProblem> findAllByStudent_IdOrderByUpdatedAtDesc(Long studentId);
    Optional<DsaProblem> findByIdAndStudent_Id(Long id, Long studentId);
    Optional<DsaProblem> findByStudent_IdAndDedupeKey(Long studentId, String dedupeKey);
    Optional<DsaProblem> findByStudent_IdAndDedupeKeyAndIdNot(Long studentId, String dedupeKey, Long id);
}
