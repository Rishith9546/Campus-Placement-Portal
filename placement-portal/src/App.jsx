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

function App() {
  return (
    <Routes>
      <Route index element={<HomePage />} />
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
        <Route path="/jobs/:id" element={<JobDetails />} />
        <Route path="/application" element={<Application/>}/>
        <Route path="/recruiter/applicants" element={<ViewApplicants/>}/>
        <Route path="/recruiter/shortlisted" element={<Shortlisted/>}/>
        <Route path="/recruiter/manage-jobs" element={<ManageJobs/>}/>
    </Routes>
  );
}

export default App;