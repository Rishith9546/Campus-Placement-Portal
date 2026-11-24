import { Routes, Route } from "react-router-dom";
import "./App.css";

import { HomePage } from "./HomePage/HomePage";
import StudentAuth from "./StudentAuth/StudentAuth";
import StudentDashboard from "./Student/StudentDashboard";
import RecruiterAuth from "./RecruiterAuth/RecruiterAuth";
import RecruiterDashboard from "./RecruiterDashboard/RecruiterDashboard";
import ViewJobs from "./Student/ViewJobs.jsx";
import {JobDetails} from "./Student/JobDetails.jsx";
import {Application} from "./StudentApplication/Application.jsx";
import {ViewApplicants} from "./RecuriterApplication/ViewApplicants.jsx";
import Shortlisted from "./Shortlisted/Shortlisted.jsx";
import ManageJobs from "./Recuriter-ManageJobs/ManageJobs.jsx";
import {ViewJobsRecruiter} from "./Recuriter-ManageJobs/ViewJobsRecruiter.jsx";
import MockInterview from "./Student/MockInterview.jsx";
import AdminAuth from "./AdminAuth/AdminAuth.jsx";
import AdminDashboard from "./AdminDashboard/AdminDashboard.jsx";
import StudentProfile from "./Student/StudentProfile.jsx";
import DsaTracker from "./Student/DsaTracker.jsx";
import Aptitude from "./Student/Aptitude.jsx";
import JobMatches from "./Student/JobMatches.jsx";
import ResumeAnalyzer from "./Student/ResumeAnalyzer.jsx";
import PreparationRoadmap from "./Student/PreparationRoadmap.jsx";
import { Headers } from "./Student/Headers.jsx";
import "./ProjectPolish.css";

function App() {
  return (
    <Routes>
      <Route index element={<HomePage />} />
      <Route path="/adminAuth" element={<AdminAuth />} />
      <Route path="/adminDashboard" element={<AdminDashboard />} />
      <Route path="/studentAuth" element={<StudentAuth />} />
                  <Route
                path="/dashboard"
                element={<StudentDashboard />}
            />
       <Route path="/recruiterAuth" element={<RecruiterAuth/>}/>
       <Route
    path="/recruiterDashboard"
    element={<RecruiterDashboard />}
/>
        <Route path="/viewjobs" element={<ViewJobs/>} />
        <Route path="/profile" element={<StudentProfile />} />
        <Route path="/dsa-tracker" element={<DsaTracker />} />
        <Route path="/aptitude" element={<Aptitude />} />
        <Route path="/job-matches" element={<JobMatches />} />
        <Route path="/resume-analyzer" element={<><Headers /><ResumeAnalyzer /></>} />
        <Route path="/preparation-roadmap" element={<><Headers /><PreparationRoadmap /></>} />
        <Route path="/jobs/:id" element={<><Headers /><JobDetails /></>} />
        <Route path="/application" element={<Application/>}/>
        <Route path="/recruiter/applicants" element={<><Headers /><ViewApplicants/></>}/>
        <Route path="/recruiter/shortlisted" element={<><Headers /><Shortlisted/></>}/>
        <Route path="/recruiter/manage-jobs" element={<><Headers /><ManageJobs/></>}/>
        <Route path="/jobsRecuriter/:id" element={<><Headers /><ViewJobsRecruiter/></>}/>
        <Route path="/mock-interview" element={<><Headers /><MockInterview/></>}/>
    </Routes>
  );
}

export default App;
