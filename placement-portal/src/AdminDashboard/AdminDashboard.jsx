import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Activity, ArrowDownUp, BarChart3, BookOpenCheck, Brain, CalendarDays,
  CheckCircle2, ChevronDown, CircleHelp, ClipboardList, Code2, FileText,
  GraduationCap, LogOut, MessageSquareText, Search, ShieldCheck, Sparkles,
  Users, UsersRound
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "./AdminDashboard.css";

const API = "http://localhost:8080/api";

const trackedMetrics = [
  { label: "Actively preparing", value: "—", detail: "Preparation activity isn’t tracked yet", icon: Activity, tone: "blue" },
  { label: "Need improvement", value: "—", detail: "Requires readiness scores", icon: Brain, tone: "amber" },
  { label: "Average readiness", value: "—", detail: "No readiness score data", icon: BarChart3, tone: "violet" },
  { label: "Average resume score", value: "—", detail: "Analysis results aren’t stored", icon: FileText, tone: "teal" },
  { label: "Mock interview score", value: "—", detail: "Interview history isn’t stored", icon: MessageSquareText, tone: "blue" },
  { label: "Aptitude score", value: "—", detail: "Aptitude tests aren’t available", icon: Brain, tone: "amber" },
  { label: "DSA completion", value: "—", detail: "No coding tracker is connected", icon: Code2, tone: "violet" },
];

const sections = [
  ["overview", "Overview", BarChart3],
  ["students", "Student monitoring", Users],
  ["gaps", "Skill gaps", Brain],
  ["programs", "Training programs", CalendarDays],
  ["analytics", "Preparation analytics", Activity],
];

function DataUnavailable({ icon: Icon = CircleHelp, title, children }) {
  return <div className="prep-empty-state">
    <span className="prep-empty-icon"><Icon size={20} /></span>
    <strong>{title}</strong>
    <p>{children}</p>
  </div>;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [studentCount, setStudentCount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || localStorage.getItem("role") !== "ROLE_ADMIN") {
      navigate("/adminAuth", { replace: true });
      return;
    }
    let current = true;
    fetch(`${API}/admin/overview`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Could not load the student count.");
        if (current) setStudentCount(Number(data.students));
      })
      .catch((requestError) => {
        if (!current) return;
        setError(requestError.message || "Unable to connect to the server.");
        toast.error("Student overview could not be loaded.");
      })
      .finally(() => { if (current) setLoading(false); });
    return () => { current = false; };
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/", { replace: true });
  };

  const jumpTo = (id) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return <div className="prep-dashboard-shell">
    <aside className="prep-sidebar">
      <Link className="prep-brand" to="/adminDashboard" aria-label="Placement Portal home">
        <span className="prep-brand-mark">P</span><span><strong>Placement Portal</strong><small>PLACEMENT OFFICE</small></span>
      </Link>
      <div className="prep-side-label">WORKSPACE</div>
      <nav className="prep-nav" aria-label="Placement preparation sections">
        {sections.map(([id, label, Icon]) => <button key={id} className={activeSection === id ? "active" : ""} onClick={() => jumpTo(id)}>
          <Icon size={17} /><span>{label}</span>{activeSection === id && <i />}
        </button>)}
      </nav>
      <div className="prep-sidebar-note"><ShieldCheck size={16} /><p>Student preparation insights are visible to authorized placement staff.</p></div>
      <button className="prep-signout" onClick={logout}><LogOut size={16} /> Sign out</button>
    </aside>

    <main className="prep-main" id="overview">
      <header className="prep-topbar">
        <div className="prep-breadcrumb"><span>Placement office</span><span>/</span><strong>Preparation</strong></div>
        <div className="prep-staff"><span className="prep-staff-avatar">PO</span><span><strong>Placement Officer</strong><small>Staff workspace</small></span><ChevronDown size={15} /></div>
      </header>

      <div className="prep-content">
        <section className="prep-hero">
          <div><span className="prep-eyebrow"><Sparkles size={14} /> STUDENT READINESS</span>
            <h1>Placement preparation</h1>
            <p>Monitor student readiness, find preparation gaps, and support focused training.</p>
          </div>
          <div className="prep-updated"><span className="prep-live-dot" /> Portal data {loading ? "updating" : "connected"}</div>
        </section>

        {error && <div className="prep-error" role="alert"><span>{error}</span><button onClick={() => window.location.reload()}>Retry</button></div>}

        <section className="prep-primary-stats" aria-label="Student monitoring summary">
          <article className="prep-total-card">
            <div className="prep-total-top"><span className="prep-total-icon"><UsersRound size={19} /></span><span>MONITORING POOL</span></div>
            <strong>{loading ? "—" : studentCount ?? "—"}</strong>
            <p>Registered students</p>
            <small>Live count from the portal account directory</small>
          </article>
          {trackedMetrics.slice(0, 3).map((metric) => <MetricCard key={metric.label} metric={metric} />)}
        </section>

        <section className="prep-secondary-stats" aria-label="Preparation performance indicators">
          {trackedMetrics.slice(3).map((metric) => <MetricCard key={metric.label} metric={metric} compact />)}
        </section>

        <section className="prep-panel prep-students" id="students">
          <div className="prep-panel-heading"><div><span className="prep-section-kicker">INDIVIDUAL READINESS</span><h2>Student preparation monitoring</h2><p>Review readiness factors and identify students who may need support.</p></div><span className="prep-panel-icon"><Users size={18} /></span></div>
          <div className="prep-table-tools">
            <label className="prep-search"><Search size={16} /><input disabled placeholder="Search by name or roll number" aria-label="Search students" /></label>
            <button disabled className="prep-filter-button"><ArrowDownUp size={15} /> Sort <ChevronDown size={14} /></button>
            <button disabled className="prep-filter-button">Branch <ChevronDown size={14} /></button>
            <button disabled className="prep-filter-button">Status <ChevronDown size={14} /></button>
          </div>
          <div className="prep-table-wrap"><table><thead><tr><th>STUDENT</th><th>BRANCH · CGPA</th><th>DSA</th><th>APTITUDE</th><th>MOCK INTERVIEW</th><th>RESUME</th><th>READINESS</th><th>STATUS</th></tr></thead>
            <tbody><tr><td colSpan="8"><DataUnavailable icon={Users} title="Student readiness data isn’t connected yet">The portal can count student accounts, but it does not currently expose a staff-accessible student profile or preparation dataset. Scores and student rows will appear when that data is available.</DataUnavailable></td></tr></tbody></table></div>
          <div className="prep-table-footer"><span>0 preparation records available</span><div><button disabled aria-label="Previous page">‹</button><span>— / —</span><button disabled aria-label="Next page">›</button></div></div>
          <div className="prep-scoring-note"><CircleHelp size={15} /><span><strong>Readiness scoring:</strong> when tracked inputs are available, the score will combine DSA progress, aptitude results, technical and mock interview performance, resume quality, and profile completeness. No score is shown until those inputs exist.</span></div>
        </section>

        <section className="prep-insight-grid" id="gaps">
          <article className="prep-panel prep-insight-panel"><PanelHeading kicker="TARGETED SUPPORT" title="Skill gap analysis" icon={Brain} />
            <DataUnavailable icon={Brain} title="No skill assessment results yet">Weak topics and branch-level gaps need assessment data. This portal does not currently store student skill assessments.</DataUnavailable>
          </article>
          <article className="prep-panel prep-insight-panel"><PanelHeading kicker="CODING PRACTICE" title="DSA progress" icon={Code2} />
            <DataUnavailable icon={Code2} title="Coding progress isn’t tracked">Solved problems, topic completion, and inactive students need a coding tracker. No DSA progress will be inferred from profile skills.</DataUnavailable>
          </article>
        </section>

        <section className="prep-insight-grid prep-insight-grid-three">
          <article className="prep-panel prep-insight-panel"><PanelHeading kicker="ASSESSMENTS" title="Aptitude performance" icon={BookOpenCheck} />
            <DataUnavailable icon={BookOpenCheck} title="No aptitude test data">Quantitative, reasoning, and verbal results are not available in the current portal.</DataUnavailable>
          </article>
          <article className="prep-panel prep-insight-panel"><PanelHeading kicker="PRACTICE SESSIONS" title="Mock interviews" icon={MessageSquareText} />
            <DataUnavailable icon={MessageSquareText} title="Interview history isn’t saved">Students can use AI interview practice, but attempts and evaluations are not persisted for staff review.</DataUnavailable>
          </article>
          <article className="prep-panel prep-insight-panel"><PanelHeading kicker="RESUME QUALITY" title="Resume readiness" icon={FileText} />
            <DataUnavailable icon={FileText} title="Resume scores aren’t stored">Resume analysis runs on request and does not create a saved score or staff-facing report.</DataUnavailable>
          </article>
        </section>

        <section className="prep-panel prep-training-panel" id="programs">
          <div className="prep-panel-heading"><div><span className="prep-section-kicker">LEARNING CALENDAR</span><h2>Training & preparation programs</h2><p>Coordinate focused sessions and monitor participation.</p></div><span className="prep-panel-icon"><CalendarDays size={18} /></span></div>
          <div className="prep-training-types" aria-label="Preparation program categories">
            {["DSA training", "Aptitude", "Technical workshops", "Mock interviews", "Resume workshop", "Communication"].map((name) => <span key={name}><CheckCircle2 size={14} />{name}</span>)}
          </div>
          <DataUnavailable icon={ClipboardList} title="Training programs aren’t configured">The current system has no training schedule, registration, instructor, or attendance APIs. Program creation is unavailable until those records can be saved.</DataUnavailable>
        </section>

        <section className="prep-bottom-grid" id="analytics">
          <article className="prep-panel"><PanelHeading kicker="NEXT BEST STEP" title="Preparation recommendations" icon={Sparkles} />
            <DataUnavailable icon={Sparkles} title="Recommendations need student scores">Once assessments are tracked, recommendations can point students to DSA, aptitude, resume, or interview support using transparent thresholds.</DataUnavailable>
          </article>
          <article className="prep-panel"><PanelHeading kicker="CAMPUS TRENDS" title="Preparation analytics" icon={BarChart3} />
            <DataUnavailable icon={BarChart3} title="No preparation trends to chart">Branch comparisons, score distributions, monthly progress, and training participation will appear when those records are collected.</DataUnavailable>
          </article>
        </section>

        <footer className="prep-footer"><span><GraduationCap size={16} /> Placement preparation workspace</span><span>Scores and trends appear only from recorded student activity.</span></footer>
      </div>
    </main>
    <ToastContainer position="top-right" autoClose={3500} theme="dark" />
  </div>;
}

function MetricCard({ metric, compact = false }) {
  const Icon = metric.icon;
  return <article className={`prep-metric-card ${compact ? "compact" : ""} tone-${metric.tone}`}>
    <span className="prep-metric-icon"><Icon size={17} /></span>
    <div><p>{metric.label}</p><strong>{metric.value}</strong><small>{metric.detail}</small></div>
  </article>;
}

function PanelHeading({ kicker, title, icon: Icon }) {
  return <div className="prep-panel-heading"><div><span className="prep-section-kicker">{kicker}</span><h2>{title}</h2></div><span className="prep-panel-icon"><Icon size={18} /></span></div>;
}
