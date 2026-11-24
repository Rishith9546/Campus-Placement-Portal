package com.telusko.placement_portal.repository;
import com.telusko.placement_portal.entity.PreparationRoadmap;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface PreparationRoadmapRepository extends JpaRepository<PreparationRoadmap,Long> {
    Optional<PreparationRoadmap> findFirstByStudent_IdAndStatusOrderByCreatedAtDesc(Long studentId,PreparationRoadmap.Status status);
    List<PreparationRoadmap> findAllByStudent_IdOrderByCreatedAtDesc(Long studentId);
    Optional<PreparationRoadmap> findByIdAndStudent_Id(Long id,Long studentId);
}
