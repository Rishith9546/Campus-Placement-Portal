package com.telusko.placement_portal.repository;

import com.telusko.placement_portal.entity.StudentProfileEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.Collection;
import com.telusko.placement_portal.entity.StudentProfileEntry.EntryType;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface StudentProfileEntryRepository extends JpaRepository<StudentProfileEntry, Long> {
    List<StudentProfileEntry> findAllByStudent_IdOrderByIdDesc(Long studentId);
    Optional<StudentProfileEntry> findByIdAndStudent_Id(Long id, Long studentId);

    @Query("select e from StudentProfileEntry e join fetch e.student s where s.id in :studentIds and e.type in :types order by e.id desc")
    List<StudentProfileEntry> findComparisonEntries(@Param("studentIds") Collection<Long> studentIds, @Param("types") Collection<EntryType> types);
}
