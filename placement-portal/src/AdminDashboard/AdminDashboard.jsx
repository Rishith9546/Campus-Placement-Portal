import { useCallback, useEffect, useState } from "react";
import { ArrowRight, Bell, BriefcaseBusiness, Building2, CalendarClock, CheckCircle2, ClipboardCheck, FileClock, RefreshCw, UserRoundCog, Users, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { adminNavigation } from "./adminNavigation.js";
import "./AdminDashboard.css";

const API = "http://localhost:8080/api/admin/dashboard/overview";
const statusLabels = {
  APPLIED: "Applied", UNDER_REVIEW: "Under review", SHORTLISTED: "Shortlisted",
  INTERVIEW_SCHEDULED: "Interview scheduled", INTERVIEWED: "Interviewed",
  SELECTED: "Selected", REJECTED: "Rejected",
};
const statusColors = {
  APPLIED: "#4d8cc9", UNDER_REVIEW: "#8b79c6", SHORTLISTED: "#2f9a82",
  INTERVIEW_SCHEDULED: "#d59a38", INTERVIEWED: "#cf7751", SELECTED: "#34845e", REJECTED: "#c75c65",
};
const quickLinks = [
  { key: "students", title: "View Students", icon: Users },
  { key: "recruiters", title: "Manage Recruiters", icon: UserRoundCog },
  { key: "jobs", title: "Manage Jobs", icon: BriefcaseBusiness },
  { key: "applications", title: "View Applications", icon: ClipboardCheck },
  { key: "announcements", title: "Create Announcement", icon: Bell },
];

function ChartBars({ title, icon: Icon, entries, colors = [] }) {
  const max = Math.max(1, ...entries.map(([, value]) => Number(value) || 0));
  return <article className="admin-surface admin-chart-panel">
    <header className="admin-surface-heading"><div><span className="admin-eyebrow">LIVE DATABASE</span><h2>{title}</h2></div><span className="admin-surface-icon"><Icon size={18} /></span></header>
    {entries.length ? <div className="admin-chart-bars">{entries.map(([label, value], index) => <div className="admin-chart-row" key={label}>
      <div className="admin-chart-label"><span>{label}</span><strong>{Number(value) || 0}</strong></div>
      <div className="admin-chart-track"><span style={{ width: `${Math.max(value ? 2 : 0, ((Number(value) || 0) / max) * 100)}%`, background: colors[index % colors.length] || undefined }} /></div>
    </div>)}</div> : <div className="admin-chart-empty">No records available for this chart.</div>}
  </article>;
}

function timestamp(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [state, setState] = useState("loading");
  const [error, setError] = useState("");
  const loadDashboard = useCallback(async () => {
    setState("loading");
    setError("");
    try {
      const response = await fetch(API, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      if (response.status === 401 || response.status === 403) throw new Error("Your administrator session is not authorized to view dashboard statistics.");
      if (!response.ok) throw new Error("Dashboard data could not be loaded. Check that the backend is running and try again.");
      setData(await response.json());
      setState("ready");
    } catch (err) {
      setError(err.message || "An unexpected error occurred while loading the dashboard.");
      setState("error");
    }
  }, []);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  const stats = data?.statistics || {};
  const statCards = [
    ["Registered students", stats.students, Users, "students"],
    ["Recruiters", stats.recruiters, UserRoundCog, "recruiters"],
    ["Companies", stats.companies, Building2, "companies"],
    ["Jobs posted", stats.jobs, BriefcaseBusiness, "jobs"],
    ["Active jobs", stats.activeJobs, CheckCircle2, "active"],
    ["Closed / expired jobs", stats.closedJobs, XCircle, "closed"],
    ["Applications", stats.applications, ClipboardCheck, "applications"],
    ["Shortlisted", stats.shortlisted, CheckCircle2, "shortlisted"],
  ];
  const quickNav = adminNavigation.reduce((map, item) => (map[item.key] = item, map), {});

  return <div className="admin-overview-page">
    <section className="admin-welcome-card">
      <div className="admin-welcome-copy"><span className="admin-eyebrow">CAMPUS PLACEMENT PORTAL</span><h2>Placement overview</h2><p>Live counts and recent activity from the portal database, updated when this page loads.</p></div>
      <div className="admin-welcome-art" aria-hidden="true"><span className="admin-art-ring ring-one" /><span className="admin-art-ring ring-two" /><span className="admin-art-core"><BriefcaseBusiness size={28} /></span></div>
    </section>

    {state === "error" && <section className="admin-load-error" role="alert"><div><strong>Dashboard unavailable</strong><p>{error}</p></div><button onClick={loadDashboard}><RefreshCw size={15} /> Retry</button></section>}

    {state === "loading" && <section className="admin-stat-grid" aria-label="Loading dashboard statistics">{statCards.map(([label]) => <article className="admin-stat-card is-loading" key={label}><span className="admin-skeleton" /><span className="admin-skeleton short" /><span className="admin-skeleton tiny" /></article>)}</section>}

    {state === "ready" && <>
      <section className="admin-overview-heading"><div><span className="admin-eyebrow">DATABASE SNAPSHOT</span><h2>Portal statistics</h2><p>Counts reflect saved records. No growth estimates or sample values are shown.</p></div><span className="admin-live-badge"><i /> Live data</span></section>
      <section className="admin-stat-grid" aria-label="Portal statistics">
        {statCards.map(([label, value, Icon, accent]) => <article className={`admin-stat-card accent-${accent}`} key={label}>
          <div className="admin-stat-top"><span className="admin-stat-icon"><Icon size={18} /></span><span className="admin-stat-source">DATABASE</span></div>
          <strong>{Number(value ?? 0).toLocaleString()}</strong><span className="admin-stat-label">{label}</span>
        </article>)}
      </section>

      <section className="admin-chart-grid" aria-label="Placement analytics">
        <ChartBars title="Application status distribution" icon={ClipboardCheck} entries={Object.entries(data.applicationStatuses || {}).map(([key, value]) => [statusLabels[key] || key.replaceAll("_", " "), value])} colors={Object.keys(data.applicationStatuses || {}).map((key) => statusColors[key])} />
        <ChartBars title="Jobs overview" icon={BriefcaseBusiness} entries={Object.entries(data.jobStatuses || {}).map(([key, value]) => [key === "UNDATED" ? "No deadline" : key[0] + key.slice(1).toLowerCase(), value])} colors={["#358c79", "#cb7852", "#99a8b3"]} />
        <ChartBars title="Students by branch" icon={Users} entries={Object.entries(data.studentsByBranch || {})} colors={["#4387b8", "#55a18a", "#8b79c6", "#d59a38"]} />
        <article className="admin-surface admin-placement-note"><header className="admin-surface-heading"><div><span className="admin-eyebrow">PLACEMENT OUTCOMES</span><h2>Placement overview</h2></div><span className="admin-surface-icon"><CheckCircle2 size={18} /></span></header>
          {data.placementDataAvailable ? <p>Placement outcome records are available in this portal.</p> : <div className="admin-support-note"><strong>Placement totals are not available</strong><p>The current schema tracks application stages, including “Selected”, but has no offer acceptance or placement record. Selected applications are not counted as placed students.</p></div>}
        </article>
      </section>

      <section className="admin-overview-grid">
        <article className="admin-surface admin-activity-panel">
          <header className="admin-surface-heading"><div><span className="admin-eyebrow">LATEST RECORDS</span><h2>Recent activity</h2></div><span className="admin-surface-icon"><FileClock size={18} /></span></header>
          {data.recentActivity?.length ? <div className="admin-activity-list">{data.recentActivity.map((item, index) => <div className="admin-activity-item" key={`${item.type}-${item.timestamp}-${index}`}>
            <span className={`admin-activity-mark ${item.type === "JOB" ? "job" : "application"}`}>{item.type === "JOB" ? <BriefcaseBusiness size={15} /> : <ClipboardCheck size={15} />}</span>
            <div className="admin-activity-copy"><strong>{item.title}</strong><p>{item.description}</p><time dateTime={item.timestamp}>{timestamp(item.timestamp)}</time></div>
          </div>)}</div> : <div className="admin-activity-empty"><span className="admin-empty-icon"><Bell size={19} /></span><strong>No recent dated activity</strong><p>New jobs and applications with saved timestamps will appear here.</p></div>}
          <p className="admin-activity-limit"><CalendarClock size={13} /> Showing up to 10 latest jobs and applications</p>
        </article>

        <article className="admin-surface admin-quick-links-panel">
          <header className="admin-surface-heading"><div><span className="admin-eyebrow">WORKSPACE</span><h2>Quick actions</h2></div><span className="admin-surface-icon"><ArrowRight size={18} /></span></header>
          <div className="admin-quick-links">{quickLinks.map(({ key, title, icon: Icon }) => { const item = quickNav[key]; return <Link to={item.path} key={key}><span><Icon size={16} /></span><strong>{title}</strong><small>Placeholder page</small><ArrowRight size={15} /></Link>; })}</div>
        </article>
      </section>
      <p className="admin-data-note">Counts and charts are calculated from saved database records. Student and recruiter registration dates are not stored, so those registrations are not included in the activity timeline.</p>
    </>}
  </div>;
}
