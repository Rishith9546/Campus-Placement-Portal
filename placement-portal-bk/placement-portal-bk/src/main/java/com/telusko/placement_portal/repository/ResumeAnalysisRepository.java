package com.telusko.placement_portal.repository;
import com.telusko.placement_portal.entity.ResumeAnalysis;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
public interface ResumeAnalysisRepository extends JpaRepository<ResumeAnalysis,Long> {
    Optional<ResumeAnalysis> findFirstByStudent_IdAndStatusOrderByAnalyzedAtDesc(Long studentId,ResumeAnalysis.Status status);
    Optional<ResumeAnalysis> findByIdAndStudent_Id(Long id,Long studentId);
    Optional<ResumeAnalysis> findByStudent_IdAndRequestKey(Long studentId,String requestKey);
    List<ResumeAnalysis> findAllByStudent_IdOrderByAnalyzedAtDesc(Long studentId,Pageable pageable);
}
