import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";

import { HomePage } from "./HomePage/HomePage";
import StudentAuth from "./StudentAuth/StudentAuth";
import StudentDashboard from "./Student/StudentDashboard";
import RecruiterAuth from "./RecruiterAuth/RecruiterAuth";
import RecruiterDashboard from "./RecruiterDashboard/RecruiterDashboard";
import ViewJobs from "./Student/ViewJobs.jsx";
import { JobDetails } from "./Student/JobDetails.jsx";
import { Application } from "./StudentApplication/Application.jsx";
import { ViewApplicants } from "./RecuriterApplication/ViewApplicants.jsx";
import Shortlisted from "./Shortlisted/Shortlisted.jsx";
import ManageJobs from "./Recuriter-ManageJobs/ManageJobs.jsx";
import { ViewJobsRecruiter } from "./Recuriter-ManageJobs/ViewJobsRecruiter.jsx";
import MockInterview from "./Student/MockInterview.jsx";
import AdminAuth from "./AdminAuth/AdminAuth.jsx";
import AdminLayout from "./AdminDashboard/AdminLayout.jsx";
import AdminDashboard from "./AdminDashboard/AdminDashboard.jsx";
import AdminModulePlaceholder from "./AdminDashboard/AdminModulePlaceholder.jsx";
import StudentManagement from "./AdminDashboard/StudentManagement.jsx";
import RecruiterManagement from "./AdminDashboard/RecruiterManagement.jsx";
import AdminJobManagement from "./AdminDashboard/AdminJobManagement.jsx";
import AdminApplicationMonitoring from "./AdminDashboard/AdminApplicationMonitoring.jsx";
import AnnouncementManagement from "./AdminDashboard/AnnouncementManagement.jsx";
import StudentProfile from "./Student/StudentProfile.jsx";
import DsaTracker from "./Student/DsaTracker.jsx";
import Aptitude from "./Student/Aptitude.jsx";
import JobMatches from "./Student/JobMatches.jsx";
import ResumeAnalyzer from "./Student/ResumeAnalyzer.jsx";
import PreparationRoadmap from "./Student/PreparationRoadmap.jsx";
import { Headers } from "./Student/Headers.jsx";
import RequireRole from "./Auth/RequireRole.jsx";
import "./ProjectPolish.css";

const studentPage = (page) => <RequireRole role="ROLE_STUDENT" loginPath="/studentAuth">{page}</RequireRole>;
const recruiterPage = (page) => <RequireRole role="ROLE_RECRUITER" loginPath="/recruiterAuth">{page}</RequireRole>;

function App() {
  return (
    <Routes>
      <Route index element={<HomePage />} />
      <Route path="/adminAuth" element={<AdminAuth />} />
      <Route path="/adminDashboard" element={<Navigate to="/admin" replace />} />
      <Route path="/admin" element={<RequireRole role="ROLE_ADMIN" loginPath="/adminAuth"><AdminLayout /></RequireRole>}>
        <Route index element={<AdminDashboard />} />
        <Route path="students" element={<StudentManagement />} />
        <Route path="recruiters" element={<RecruiterManagement />} />
        <Route path="jobs" element={<AdminJobManagement />} />
        <Route path="applications" element={<AdminApplicationMonitoring />} />
        <Route path="announcements" element={<AnnouncementManagement />} />
        <Route path="analytics" element={<AdminModulePlaceholder moduleKey="analytics" />} />
        <Route path="audit-logs" element={<AdminModulePlaceholder moduleKey="auditLogs" />} />
        <Route path="settings" element={<AdminModulePlaceholder moduleKey="settings" />} />
      </Route>

      <Route path="/studentAuth" element={<StudentAuth />} />
      <Route path="/dashboard" element={studentPage(<StudentDashboard />)} />
      <Route path="/profile" element={studentPage(<StudentProfile />)} />
      <Route path="/dsa-tracker" element={studentPage(<DsaTracker />)} />
      <Route path="/aptitude" element={studentPage(<Aptitude />)} />
      <Route path="/job-matches" element={studentPage(<JobMatches />)} />
      <Route path="/resume-analyzer" element={studentPage(<><Headers /><ResumeAnalyzer /></>)} />
      <Route path="/preparation-roadmap" element={studentPage(<><Headers /><PreparationRoadmap /></>)} />
      <Route path="/jobs/:id" element={studentPage(<><Headers /><JobDetails /></>)} />
      <Route path="/viewjobs" element={studentPage(<ViewJobs />)} />
      <Route path="/application" element={studentPage(<Application />)} />
      <Route path="/mock-interview" element={studentPage(<><Headers /><MockInterview /></>)} />

      <Route path="/recruiterAuth" element={<RecruiterAuth />} />
      <Route path="/recruiterDashboard" element={recruiterPage(<RecruiterDashboard />)} />
      <Route path="/recruiter/applicants" element={recruiterPage(<><Headers /><ViewApplicants /></>)} />
      <Route path="/recruiter/shortlisted" element={recruiterPage(<><Headers /><Shortlisted /></>)} />
      <Route path="/recruiter/manage-jobs" element={recruiterPage(<><Headers /><ManageJobs /></>)} />
      <Route path="/jobsRecuriter/:id" element={recruiterPage(<><Headers /><ViewJobsRecruiter /></>)} />
    </Routes>
  );
}

export default App;
