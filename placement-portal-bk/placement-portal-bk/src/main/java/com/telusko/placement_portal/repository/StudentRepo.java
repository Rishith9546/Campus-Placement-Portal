package com.telusko.placement_portal.repository;

import org.springframework.data.jpa.repository.JpaRepository;


import com.telusko.placement_portal.entity.Student;
import org.springframework.data.jpa.repository.Query;

import java.util.List;


public interface StudentRepo extends JpaRepository<Student, Long>{
    @Query("select s.branch, count(s) from Student s group by s.branch order by count(s) desc")
    List<Object[]> countGroupedByBranch();

    @Query("select distinct trim(s.branch) from Student s where s.branch is not null and trim(s.branch) <> '' order by trim(s.branch)")
    List<String> findDistinctBranches();
}
