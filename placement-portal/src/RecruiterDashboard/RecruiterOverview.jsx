import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  CircleCheck,
  Clock3,
  FileCheck2,
  Handshake,
  MessageSquareText,
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
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState("");

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

    const loadAnalytics = async () => {
      try {
        const result = await axios.get(`${API}/api/recruiter/analytics`, { headers });
        if (active) setAnalytics(result.data);
      } catch (error) {
        console.error("Unable to load recruiter analytics:", error.response?.data || error.message);
        if (active) setAnalyticsError("Recruitment analytics could not be loaded.");
      } finally {
        if (active) setAnalyticsLoading(false);
      }
    };

    loadJobs();
    loadApplications();
    loadAnalytics();
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
    { label: "Total jobs posted", key: "totalJobs", note: "All your job posts", icon: BriefcaseBusiness, style: "jobs" },
    { label: "Active jobs", key: "activeJobs", note: "No deadline or deadline not passed", icon: BriefcaseBusiness, style: "jobs" },
    { label: "Closed jobs", key: "closedJobs", note: "Deadline has passed", icon: Clock3, style: "pending" },
    { label: "Applications received", key: "totalApplications", note: "Across your job posts", icon: UsersRound, style: "applications" },
    { label: "Applied", key: "applied", note: "Awaiting initial review", icon: Clock3, style: "pending" },
    { label: "Under review", key: "underReview", note: "Currently being reviewed", icon: MessageSquareText, style: "pending" },
    { label: "Shortlisted", key: "shortlisted", note: "Moving forward", icon: CheckCircle2, style: "shortlisted" },
    { label: "Interview scheduled", key: "interviewScheduled", note: "Interview stage", icon: CalendarClock, style: "applications" },
    { label: "Interviewed", key: "interviewed", note: "Interview completed", icon: Handshake, style: "shortlisted" },
    { label: "Selected", key: "selected", note: "Selected candidates", icon: CircleCheck, style: "shortlisted" },
    { label: "Rejected", key: "rejected", note: "Closed applications", icon: FileCheck2, style: "pending" },
  ];

  const pipelineStages = [
    ["Applied", "applied", "applied-dot"], ["Under review", "underReview", "review-dot"],
    ["Shortlisted", "shortlisted", "shortlist-dot"], ["Interview scheduled", "interviewScheduled", "interview-dot"],
    ["Interviewed", "interviewed", "interviewed-dot"], ["Selected", "selected", "selected-dot"],
    ["Rejected", "rejected", "rejected-dot"],
  ];
  const maxMonthly = Math.max(1, ...(analytics?.monthlyApplications || []).map((item) => item.applications));

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

      {analyticsError && <div className="recruiter-data-notice" role="alert">{analyticsError}</div>}
      <section className="recruiter-stats analytics-kpis" aria-label="Recruitment analytics key performance indicators">
        {statCards.map(({ label, key, note, icon: Icon, style }) => <article className={`recruiter-stat ${style}`} key={key}>
          <span className="recruiter-stat-icon"><Icon size={18} /></span><span className="recruiter-stat-label">{label}</span><strong>{analyticsLoading ? "—" : analytics?.[key] ?? 0}</strong><small>{note}</small>
        </article>)}
      </section>

      <section className="recruiter-analytics-grid" aria-label="Recruitment analytics">
        <article className="recruiter-panel analytics-funnel-panel">
          <div className="recruiter-panel-heading"><div><span className="recruiter-kicker">RECRUITMENT FUNNEL</span><h2>Candidate stages</h2></div><span className="recruiter-panel-icon"><UsersRound size={18} /></span></div>
          {analyticsLoading ? <p className="recruiter-empty">Loading pipeline analytics...</p> : analyticsError ? <p className="recruiter-empty">Pipeline analytics are unavailable.</p> : analytics?.totalApplications === 0 ? <div className="recruiter-empty"><strong>No candidate data yet</strong><p>Application stages will appear here after students apply.</p></div> : <div className="analytics-funnel">
            {pipelineStages.map(([label, key, dotClass]) => {
              const count = analytics?.[key] || 0;
              const percentage = analytics?.totalApplications ? Math.round(count * 100 / analytics.totalApplications) : 0;
              return <div className="analytics-funnel-row" key={key}><div className="analytics-funnel-label"><span className={`pipeline-dot ${dotClass}`} />{label}<strong>{count}</strong></div><div className="analytics-funnel-track" role="progressbar" aria-label={`${label} share of applications`} aria-valuenow={percentage} aria-valuemin="0" aria-valuemax="100"><span style={{ width: `${percentage}%` }} /></div><small>{percentage}%</small></div>;
            })}
          </div>}
        </article>

        <article className="recruiter-panel monthly-analytics-panel">
          <div className="recruiter-panel-heading"><div><span className="recruiter-kicker">APPLICATION ACTIVITY</span><h2>Applications by month</h2></div><span className="recruiter-panel-icon"><CalendarClock size={18} /></span></div>
          {analyticsLoading ? <p className="recruiter-empty">Loading application history...</p> : analyticsError ? <p className="recruiter-empty">Application history is unavailable.</p> : <div className="monthly-chart" role="img" aria-label="Applications received per month for the last six months">
            {(analytics?.monthlyApplications || []).map((item) => <div className="monthly-chart-column" key={item.month}><strong>{item.applications}</strong><div className="monthly-chart-track"><span style={{ height: `${item.applications ? Math.max(8, item.applications * 100 / maxMonthly) : 0}%` }} /></div><small>{item.month}</small></div>)}
          </div>}
        </article>

        <article className="recruiter-panel analytics-jobs-panel">
          <div className="recruiter-panel-heading"><div><span className="recruiter-kicker">ROLE PERFORMANCE</span><h2>Applications by job</h2></div><button className="recruiter-text-action" onClick={() => navigate("/recruiter/manage-jobs")}>Manage jobs <ArrowRight size={14} /></button></div>
          {analyticsLoading ? <p className="recruiter-empty">Loading job performance...</p> : analyticsError ? <p className="recruiter-empty">Job performance is unavailable.</p> : !analytics?.jobPerformance?.length ? <div className="recruiter-empty"><strong>No job posts yet</strong><p>Post a role to see its application activity.</p></div> : <div className="analytics-job-table-wrap"><table className="analytics-job-table"><thead><tr><th>Job</th><th>Status</th><th>Applications</th><th>Shortlisted</th><th>Interview</th><th>Selected</th></tr></thead><tbody>{analytics.jobPerformance.map((job) => <tr key={job.jobId}><td><strong>{job.title || "Untitled role"}</strong><small>{job.company || "Company not listed"}</small></td><td><span className={`recruiter-job-state${job.active ? "" : " closed"}`}>{job.active ? "Active" : "Closed"}</span></td><td>{job.applications}</td><td>{job.shortlisted}</td><td>{job.interviewScheduled + job.interviewed}</td><td>{job.selected}</td></tr>)}</tbody></table></div>}
          {analytics && !analyticsError && <p className="analytics-data-note">Job-view tracking is unavailable, so view-to-application conversion is not shown.</p>}
        </article>
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
