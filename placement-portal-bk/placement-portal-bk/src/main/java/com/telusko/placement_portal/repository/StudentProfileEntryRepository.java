package com.telusko.placement_portal.repository;

import com.telusko.placement_portal.entity.StudentProfileEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface StudentProfileEntryRepository extends JpaRepository<StudentProfileEntry, Long> {
    List<StudentProfileEntry> findAllByStudent_IdOrderByIdDesc(Long studentId);
    Optional<StudentProfileEntry> findByIdAndStudent_Id(Long id, Long studentId);
}
