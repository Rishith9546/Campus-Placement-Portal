package com.telusko.placement_portal.repository;
import com.telusko.placement_portal.entity.PreparationTask;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.*;
public interface PreparationTaskRepository extends JpaRepository<PreparationTask,Long> {
    List<PreparationTask> findAllByRoadmap_IdOrderByScheduledDateAscIdAsc(Long roadmapId);
    Optional<PreparationTask> findByIdAndRoadmap_Student_Id(Long id,Long studentId);
    Optional<PreparationTask> findByRoadmap_IdAndDedupeKey(Long roadmapId,String dedupeKey);
    List<PreparationTask> findAllByRoadmap_IdAndScheduledDateOrderByPriorityAsc(Long roadmapId,LocalDate date);
    List<PreparationTask> findAllByRoadmap_Student_IdOrderByCompletedAtDesc(Long studentId);
}
