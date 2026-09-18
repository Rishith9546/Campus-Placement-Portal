package com.telusko.placement_portal.repository;

import org.springframework.data.jpa.repository.JpaRepository;


import com.telusko.placement_portal.entity.Student;


public interface StudentRepo extends JpaRepository<Student, Long>{

    
}
