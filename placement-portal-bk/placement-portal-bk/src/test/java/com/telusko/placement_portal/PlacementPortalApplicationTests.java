package com.telusko.placement_portal;

import com.telusko.placement_portal.repository.UserRepository;
import com.telusko.placement_portal.repository.JobRepo;
import com.telusko.placement_portal.repository.ApplicationRepo;
import com.telusko.placement_portal.repository.AnnouncementRepo;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

@SpringBootTest
class PlacementPortalApplicationTests {
	@Autowired
	private UserRepository users;
	@Autowired
	private JobRepo jobs;
	@Autowired
	private ApplicationRepo applications;
	@Autowired
	private AnnouncementRepo announcements;

	@Test
	void contextLoads() {
	}

	@Test
	void adminStudentSearchQuerySupportsServerSideSortAndPaging() {
		var students = users.searchAdminStudents("__admin_directory_query_probe__", null, 0.0, 10.0,
				null, null, PageRequest.of(0, 5, Sort.by("branch").ascending()));
		Assertions.assertNotNull(students);
		Assertions.assertTrue(students.getNumberOfElements() <= 5);
	}

	@Test
	void adminRecruiterSearchQuerySupportsReviewFiltersAndPaging() {
		var recruiters = users.searchAdminRecruiters("__admin_recruiter_query_probe__", null, "PENDING", true,
				PageRequest.of(0, 5, Sort.by("companyName").ascending()));
		Assertions.assertNotNull(recruiters);
		Assertions.assertTrue(recruiters.getNumberOfElements() <= 5);
	}

	@Test
	void adminJobSearchAndStudentVisibilityQueriesExecuteWithPaging() {
		var records = jobs.searchAdminJobs("__admin_job_query_probe__", null, null, null, null, null,
				null, null, null, null, java.time.LocalDate.now(), PageRequest.of(0, 5, Sort.by("createdAt").descending()));
		Assertions.assertNotNull(records);
		Assertions.assertTrue(records.getNumberOfElements() <= 5);
		Assertions.assertNotNull(jobs.searchStudentVisibleJobs("__admin_job_query_probe__", java.time.LocalDate.now()));
	}

	@Test
	void adminApplicationSearchAndAggregateQueriesExecute() {
		var page = applications.searchAdminApplications("__admin_application_query_probe__", null, null, null, null,
				null, null, PageRequest.of(0, 5, Sort.by("appliedAt").descending()));
		Assertions.assertNotNull(page);
		Assertions.assertTrue(page.getNumberOfElements() <= 5);
		Assertions.assertNotNull(applications.countNormalizedStatuses());
		Assertions.assertNotNull(applications.adminApplicationBranchStatistics());
		Assertions.assertNotNull(applications.adminApplicationCompanyStatistics());
	}

	@Test
	void announcementManagementAndAudienceQueriesExecute() {
		var page = announcements.searchAdmin("__announcement_query_probe__", null, "DRAFT", null, PageRequest.of(0, 5));
		Assertions.assertNotNull(page);
		var students = announcements.visibleTo("STUDENTS", "__branch_query_probe__", java.time.LocalDateTime.now(), PageRequest.of(0, 5));
		var recruiters = announcements.visibleTo("RECRUITERS", null, java.time.LocalDateTime.now(), PageRequest.of(0, 5));
		var single = announcements.visibleById(-1L, "STUDENTS", "__branch_query_probe__", java.time.LocalDateTime.now());
		Assertions.assertNotNull(students);
		Assertions.assertNotNull(recruiters);
		Assertions.assertNotNull(single);
	}

}
