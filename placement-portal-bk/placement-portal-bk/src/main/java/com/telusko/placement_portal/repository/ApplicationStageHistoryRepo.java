package com.telusko.placement_portal.repository;

import com.telusko.placement_portal.entity.ApplicationStageHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ApplicationStageHistoryRepo extends JpaRepository<ApplicationStageHistory, Long> {
    List<ApplicationStageHistory> findAllByApplicationIdOrderByChangedAtAscIdAsc(Long applicationId);
}
