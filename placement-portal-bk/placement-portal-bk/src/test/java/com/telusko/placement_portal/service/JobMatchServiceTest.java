package com.telusko.placement_portal.service;

import com.telusko.placement_portal.dto.JobMatchDto;
import com.telusko.placement_portal.entity.Job;
import com.telusko.placement_portal.entity.Student;
import com.telusko.placement_portal.entity.User;
import com.telusko.placement_portal.entity.application;
import com.telusko.placement_portal.repository.ApplicationRepo;
import com.telusko.placement_portal.repository.JobRepo;
import com.telusko.placement_portal.repository.StudentRepo;
import com.telusko.placement_portal.security.UserPrincipal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import java.time.LocalDate;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JobMatchServiceTest {
    @Mock JobRepo jobs;
    @Mock StudentRepo students;
    @Mock ApplicationRepo applications;
    private JobMatchService service;
    private UserPrincipal principal;

    @BeforeEach void setUp(){
        service=new JobMatchService(jobs,students,applications);
        User user=new User("Student","student@example.test","password","STUDENT");
        ReflectionTestUtils.setField(user,"id",27L);
        principal=new UserPrincipal(user);
    }

    @Test void fullSkillBranchAndCgpaMatchScoresOneHundred(){
        Student s=student("react, Spring Boot","Computer Science Engineering",8.1,0,2027);
        Job j=job("React.js, SpringBoot","Eligible branches: CSE/IT; minimum CGPA 7.0");
        JobMatchDto result=evaluate(s,j,Optional.empty());
        assertEquals(100,result.matchScore());assertEquals("ELIGIBLE",result.eligibilityStatus());
        assertEquals(100,result.skillMatchScore());assertEquals(100,result.branchMatchScore());assertEquals(100,result.cgpaMatchScore());
    }

    @Test void missingSkillLowersScoreButDoesNotMakeStudentIneligible(){
        Student s=student("Java","CSE",8.0,0,2027);
        Job j=job("Java, React","All branches; minimum CGPA 6.0");
        JobMatchDto result=evaluate(s,j,Optional.empty());
        assertEquals(63,result.matchScore());assertEquals("ELIGIBLE",result.eligibilityStatus());
        assertEquals(java.util.List.of("React"),result.missingSkills());
    }

    @Test void confirmedBranchMismatchMakesStudentIneligible(){
        Student s=student("Java","CSE",8.0,0,2027);
        Job j=job("Java","Eligible branches: ECE; minimum CGPA 7.0");
        JobMatchDto result=evaluate(s,j,Optional.empty());
        assertEquals("NOT_ELIGIBLE",result.eligibilityStatus());assertEquals(0,result.branchMatchScore());
        assertTrue(result.eligibilityReasons().stream().anyMatch(r->r.contains("does not match")));
    }

    @Test void lowCgpaIsHardFailureAndNoCgpaRuleIsUnrestricted(){
        Job required=job("Java","Minimum CGPA 7.0");
        assertEquals("NOT_ELIGIBLE",evaluate(student("Java","CSE",6.9,0,2027),required,Optional.empty()).eligibilityStatus());
        Job unrestricted=job("Java","All branches");
        assertEquals("ELIGIBLE",evaluate(student("Java","CSE",null,0,2027),unrestricted,Optional.empty()).eligibilityStatus());
    }

    @Test void absentProfileDataOrUnparseableCriteriaRequiresReview(){
        Job j=job("Java","Eligible branches: CSE");
        JobMatchDto missing=evaluate(student("Java",null,null,null,null),j,Optional.empty());
        assertEquals("NEEDS_REVIEW",missing.eligibilityStatus());
        JobMatchDto noCriteria=evaluate(student("",null,null,null,null),job("",null),Optional.empty());
        assertFalse(noCriteria.matchScoreAvailable());assertEquals(0,noCriteria.matchScore());assertEquals("NEEDS_REVIEW",noCriteria.eligibilityStatus());
    }

    @Test void appliedStatusAndDeadlineAreReturnedFromSavedRecords(){
        Job j=job("Java","All branches");j.setDeadline(LocalDate.now().minusDays(1));
        application app=new application();app.setStatus("SHORTLISTED");
        JobMatchDto result=evaluate(student("Java","CSE",8.0,0,2027),j,Optional.of(app));
        assertTrue(result.applied());assertEquals("SHORTLISTED",result.applicationStatus());assertFalse(result.active());
    }

    @Test void backlogAndGraduationRulesAreCheckedWhenPresent(){
        Job j=job("Java","Maximum 1 backlog; graduation year 2026-2028");
        assertEquals("ELIGIBLE",evaluate(student("Java","CSE",8.0,1,2027),j,Optional.empty()).eligibilityStatus());
        assertEquals("NOT_ELIGIBLE",evaluate(student("Java","CSE",8.0,2,2027),j,Optional.empty()).eligibilityStatus());
    }

    private JobMatchDto evaluate(Student student,Job job,Optional<application> application){
        String status=application.map(com.telusko.placement_portal.entity.application::getStatus).orElse(null);
        JobMatchDto result=service.evaluateCandidate(job,student,status);
        assertTrue(result.matchScore()>=0&&result.matchScore()<=100);
        return result;
    }
    private Student student(String skills,String branch,Double cgpa,Integer backlogs,Integer gradYear){Student s=new Student();s.setId(27L);s.setSkills(skills);s.setBranch(branch);s.setCgpa(cgpa);s.setBacklogs(backlogs);s.setGraduationYear(gradYear);return s;}
    private Job job(String skills,String eligibility){Job j=new Job();ReflectionTestUtils.setField(j,"id",44L);j.setTitle("Software Engineer");j.setCompany("Example Co");j.setSkills(skills);j.setEligibility(eligibility);j.setApprovalStatus("APPROVED");return j;}
}
