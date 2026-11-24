import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  Clock3,
  UsersRound,
} from "lucide-react";
import "./RecruiterOverview.css";

const API = "http://localhost:8080";
const statusOf = (application) => (application.status || "APPLIED").toUpperCase();

export function RecruiterOverview({ company, onPostJob }) {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [applicationsLoading, setApplicationsLoading] = useState(true);
  const [jobsError, setJobsError] = useState("");
  const [applicationsError, setApplicationsError] = useState("");

  useEffect(() => {
    let active = true;
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    const loadJobs = async () => {
      try {
        const result = await axios.get(`${API}/api/jobs/allJobsById`, { headers });
        if (active) setJobs(Array.isArray(result.data) ? result.data : []);
      } catch (error) {
        console.error("Unable to load recruiter jobs:", error.response?.data || error.message);
        if (active) setJobsError("Your job postings could not be loaded.");
      } finally {
        if (active) setJobsLoading(false);
      }
    };

    const loadApplications = async () => {
      try {
        const result = await axios.get(`${API}/api/applications/recruiter/applicants`, { headers });
        if (active) setApplications(Array.isArray(result.data) ? result.data : []);
      } catch (error) {
        console.error("Unable to load recruiter applicants:", error.response?.data || error.message);
        if (active) setApplicationsError("Applicant activity could not be loaded.");
      } finally {
        if (active) setApplicationsLoading(false);
      }
    };

    loadJobs();
    loadApplications();
    return () => { active = false; };
  }, []);

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const activeJobs = jobs.filter((job) =>
    !job.deadline || new Date(`${job.deadline}T23:59:59`) >= todayStart
  );
  const appliedCount = applications.filter((item) => statusOf(item) === "APPLIED").length;
  const shortlistedCount = applications.filter((item) => statusOf(item) === "SHORTLISTED").length;
  const rejectedCount = applications.filter((item) => statusOf(item) === "REJECTED").length;
  const updatedCount = shortlistedCount + rejectedCount;
  const responseRate = applications.length ? Math.round((updatedCount / applications.length) * 100) : 0;
  const recentApplicants = [...applications]
    .sort((first, second) => new Date(second.appliedAt || 0) - new Date(first.appliedAt || 0))
    .slice(0, 5);
  const recentJobs = [...jobs]
    .sort((first, second) => new Date(second.createdAt || 0) - new Date(first.createdAt || 0))
    .slice(0, 3);
  const closingSoon = activeJobs
    .filter((job) => job.deadline && (new Date(`${job.deadline}T23:59:59`) - todayStart) / 86400000 <= 7)
    .sort((first, second) => new Date(first.deadline) - new Date(second.deadline))
    .slice(0, 3);
  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 18 ? "Good afternoon" : "Good evening";
  const todayLabel = now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

  const statCards = [
    { label: "Active jobs", value: jobsLoading || jobsError ? "—" : activeJobs.length, note: "Open opportunities", icon: BriefcaseBusiness, style: "jobs" },
    { label: "Applications", value: applicationsLoading || applicationsError ? "—" : applications.length, note: "Across your job posts", icon: UsersRound, style: "applications" },
    { label: "Awaiting review", value: applicationsLoading || applicationsError ? "—" : appliedCount, note: "Need your attention", icon: Clock3, style: "pending" },
    { label: "Shortlisted", value: applicationsLoading || applicationsError ? "—" : shortlistedCount, note: "Candidates moving forward", icon: CheckCircle2, style: "shortlisted" },
  ];

  return (
    <main className="recruiter-overview">
      <section className="recruiter-welcome">
        <div>
          <span className="recruiter-overview-date">{todayLabel}</span>
          <h1>{greeting}{company ? `, ${company}` : ""}</h1>
          <p>Here’s your hiring overview. See what needs your attention today.</p>
        </div>
        <button className="recruiter-primary-action" onClick={onPostJob}><span>Post a job</span><ArrowRight size={16} /></button>
      </section>

      {(jobsError || applicationsError) && <div className="recruiter-data-notice" role="status">{[jobsError, applicationsError].filter(Boolean).join(" ")}</div>}

      <section className="recruiter-stats" aria-label="Hiring summary">
        {statCards.map(({ label, value, note, icon: Icon, style }) => <article className={`recruiter-stat ${style}`} key={label}>
          <span className="recruiter-stat-icon"><Icon size={18} /></span><span className="recruiter-stat-label">{label}</span><strong>{value}</strong><small>{note}</small>
        </article>)}
      </section>

      <div className="recruiter-insights-grid">
        <section className="recruiter-panel pipeline-panel">
          <div className="recruiter-panel-heading"><div><span className="recruiter-kicker">CANDIDATE PIPELINE</span><h2>Application status</h2></div><span className="recruiter-panel-icon"><CalendarClock size={18} /></span></div>
          {applicationsLoading ? <p className="recruiter-empty">Loading application activity...</p> : applicationsError ? <p className="recruiter-empty">Pipeline data is unavailable right now.</p> : applications.length === 0 ? <div className="recruiter-empty"><strong>No applicants yet</strong><p>New applications will appear here as students apply to your roles.</p></div> : <>
            <div className="recruiter-response-rate"><strong>{responseRate}%</strong><span>of applications have a decision</span></div>
            <div className="recruiter-response-progress" role="progressbar" aria-label="Applications with a decision" aria-valuenow={responseRate} aria-valuemin="0" aria-valuemax="100"><span style={{ width: `${responseRate}%` }} /></div>
            <div className="recruiter-pipeline-rows">
              <div><span className="pipeline-dot applied-dot" />Awaiting review<strong>{appliedCount}</strong></div>
              <div><span className="pipeline-dot shortlist-dot" />Shortlisted<strong>{shortlistedCount}</strong></div>
              <div><span className="pipeline-dot rejected-dot" />Rejected<strong>{rejectedCount}</strong></div>
            </div>
          </>}
        </section>

        <section className="recruiter-panel recent-candidates-panel">
          <div className="recruiter-panel-heading"><div><span className="recruiter-kicker">LATEST ACTIVITY</span><h2>Recent applicants</h2></div><button className="recruiter-text-action" onClick={() => navigate("/recruiter/applicants")}>View all <ArrowRight size={14} /></button></div>
          {applicationsLoading ? <p className="recruiter-empty">Loading recent applicants...</p> : applicationsError ? <p className="recruiter-empty">Applicant activity is unavailable right now.</p> : recentApplicants.length === 0 ? <div className="recruiter-empty"><strong>Your next great hire starts here.</strong><p>Share a role to start receiving applications.</p></div> : <div className="recruiter-candidate-list">
            {recentApplicants.map((application) => {
              const candidate = application.student || {};
              const title = application.job?.title || "Job application";
              const name = candidate.name || "Student";
              const initials = name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
              const status = statusOf(application);
              return <button className="recruiter-candidate" key={application.id} onClick={() => navigate("/recruiter/applicants")}>
                <span className="candidate-avatar">{initials}</span><span className="candidate-copy"><strong>{name}</strong><small>{title} · {application.appliedAt ? new Date(application.appliedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "Recently"}</small></span><span className={`candidate-status status-${status.toLowerCase()}`}>{status.replaceAll("_", " ")}</span>
              </button>;
            })}
          </div>}
        </section>

        <section className="recruiter-panel recruiter-jobs-panel">
          <div className="recruiter-panel-heading"><div><span className="recruiter-kicker">YOUR OPENINGS</span><h2>Recent job posts</h2></div><button className="recruiter-text-action" onClick={() => navigate("/recruiter/manage-jobs")}>Manage jobs <ArrowRight size={14} /></button></div>
          {jobsLoading ? <p className="recruiter-empty">Loading your job posts...</p> : jobsError ? <p className="recruiter-empty">Job posts are unavailable right now.</p> : recentJobs.length === 0 ? <div className="recruiter-empty"><strong>No job posts yet</strong><p>Post your first opening to connect with campus talent.</p><button onClick={onPostJob}>Create a job post <ArrowRight size={14} /></button></div> : <div className="recruiter-job-list">
            {recentJobs.map((job) => {
              const closed = job.deadline && new Date(`${job.deadline}T23:59:59`) < todayStart;
              const applicants = applications.filter((application) => String(application.jobId) === String(job.id)).length;
              return <article className="recruiter-job-row" key={job.id}>
                <span className="recruiter-job-mark">{(job.company || "J").trim().slice(0, 1).toUpperCase()}</span><div className="recruiter-job-copy"><strong>{job.title || "Untitled role"}</strong><small>{job.company || company || "Company"} · {job.jobType || "Role type not listed"}</small></div><span className={`recruiter-job-state${closed ? " closed" : ""}`}>{closed ? "Closed" : "Active"}</span><span className="recruiter-job-applicants">{applicants} applicants</span><button className="recruiter-job-view" onClick={() => navigate(`/jobsRecuriter/${job.id}`)}>View</button>
              </article>;
            })}
          </div>}
        </section>

        <section className="recruiter-panel deadlines-panel">
          <div className="recruiter-panel-heading"><div><span className="recruiter-kicker">UPCOMING DEADLINES</span><h2>Closing soon</h2></div><span className="recruiter-panel-icon"><Clock3 size={18} /></span></div>
          {jobsLoading ? <p className="recruiter-empty">Checking deadlines...</p> : jobsError ? <p className="recruiter-empty">Deadlines are unavailable right now.</p> : closingSoon.length === 0 ? <div className="recruiter-empty"><strong>No closing deadlines soon</strong><p>Job deadlines within the next seven days will show here.</p></div> : <div className="recruiter-deadline-list">
            {closingSoon.map((job) => <button className="recruiter-deadline" key={job.id} onClick={() => navigate(`/jobsRecuriter/${job.id}`)}><span><strong>{job.title}</strong><small>{job.company || company || "Company"}</small></span><span className="deadline-date">{new Date(`${job.deadline}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span></button>)}
          </div>}
        </section>
      </div>
    </main>
  );
}

export default RecruiterOverview;
