import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Activity, ArrowRight, BarChart3, BookOpen, Check, ChevronDown, CircleHelp, Code2, ExternalLink, FileEdit, FilterX, LoaderCircle, Plus, Search, Target, Trash2, X } from "lucide-react";
import { Headers } from "./Headers.jsx";
import { DSA_DIFFICULTIES, DSA_PLATFORMS, DSA_STATUSES, DSA_TOPICS, dsaLabel } from "./Functions/dsaOptions.js";
import "./DsaTracker.css";

const API = "http://localhost:8080/api/student/dsa";
const localToday = () => { const date = new Date(); date.setMinutes(date.getMinutes() - date.getTimezoneOffset()); return date.toISOString().slice(0, 10); };
const emptyProblem = () => ({ title: "", problemUrl: "", platform: "LEETCODE", topic: "ARRAYS", difficulty: "EASY", status: "IN_PROGRESS", solvedAt: "", notes: "", timeComplexity: "", spaceComplexity: "" });
const enumValues = (options) => options.map(([value]) => value);
const apiErrorMessage = (error, fallback) => {
  const body = error.response?.data;
  return (typeof body === "string" ? body : body?.detail || body?.message) || fallback;
};

function DsaTracker() {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editor, setEditor] = useState(null);
  const [form, setForm] = useState(emptyProblem);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ topic: "", difficulty: "", platform: "", status: "" });

  const headers = useCallback(() => ({ Authorization: `Bearer ${localStorage.getItem("token")}` }), []);
  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError("");
    try {
      const [problemResponse, statsResponse] = await Promise.all([
        axios.get(`${API}/problems`, { headers: headers(), timeout: 15000 }),
        axios.get(`${API}/stats`, { headers: headers(), timeout: 15000 }),
      ]);
      setProblems(Array.isArray(problemResponse.data) ? problemResponse.data : []);
      setStats(statsResponse.data);
    } catch (requestError) {
      if (requestError.response?.status === 401 || requestError.response?.status === 403) {
        navigate("/studentAuth", { replace: true });
        return;
      }
      setError(apiErrorMessage(requestError, "Your DSA tracker could not be loaded. Check the connection and try again."));
    } finally { if (!silent) setLoading(false); }
  }, [headers, navigate]);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/studentAuth", { replace: true });
      return;
    }
    loadData();
  }, [loadData, navigate]);

  const filteredProblems = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return problems.filter((problem) => {
      const matchesSearch = !query || [problem.title, problem.notes, problem.problemUrl].some((value) => (value || "").toLocaleLowerCase().includes(query));
      return matchesSearch
        && (!filters.topic || problem.topic === filters.topic)
        && (!filters.difficulty || problem.difficulty === filters.difficulty)
        && (!filters.platform || problem.platform === filters.platform)
        && (!filters.status || problem.status === filters.status);
    });
  }, [problems, search, filters]);

  const updateFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value }));
  const openCreate = () => { setForm(emptyProblem()); setEditor({ id: null }); setError(""); setNotice(""); };
  const openEdit = (problem) => {
    setForm({ ...emptyProblem(), ...problem, problemUrl: problem.problemUrl || "", solvedAt: problem.solvedAt || "", notes: problem.notes || "", timeComplexity: problem.timeComplexity || "", spaceComplexity: problem.spaceComplexity || "" });
    setEditor({ id: problem.id }); setError(""); setNotice("");
  };
  const updateForm = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value, ...(name === "status" && value === "SOLVED" && !current.solvedAt ? { solvedAt: localToday() } : {}) }));
  };

  const saveProblem = async (event) => {
    event.preventDefault();
    setSaving(true); setError(""); setNotice("");
    const payload = { ...form, problemUrl: form.problemUrl.trim() || null, solvedAt: form.status === "SOLVED" ? form.solvedAt : null };
    try {
      if (editor.id) await axios.put(`${API}/problems/${editor.id}`, payload, { headers: { ...headers(), "Content-Type": "application/json" } });
      else await axios.post(`${API}/problems`, payload, { headers: { ...headers(), "Content-Type": "application/json" } });
      setEditor(null);
      setNotice(editor.id ? "Problem record updated." : "Problem added to your tracker.");
      await loadData(true);
    } catch (requestError) {
      setError(apiErrorMessage(requestError, "Could not save this problem. Check the fields and try again."));
    } finally { setSaving(false); }
  };

  const deleteProblem = async (problem) => {
    if (!window.confirm(`Delete “${problem.title}” from your coding tracker?`)) return;
    setDeletingId(problem.id); setError(""); setNotice("");
    try {
      await axios.delete(`${API}/problems/${problem.id}`, { headers: headers() });
      setNotice("Problem deleted. Your progress and readiness score have been updated.");
      await loadData(true);
    } catch (requestError) {
      setError(apiErrorMessage(requestError, "Could not delete this problem."));
    } finally { setDeletingId(null); }
  };

  const clearFilters = () => { setSearch(""); setFilters({ topic: "", difficulty: "", platform: "", status: "" }); };
  const hasFilters = Boolean(search || Object.values(filters).some(Boolean));

  return <>
    <Headers />
    <main className="dsa-page">
      <div className="dsa-page-inner">
        <div className="dsa-breadcrumb"><button onClick={() => navigate("/dashboard")}>Dashboard</button><span>/</span><strong>DSA tracker</strong></div>
        <header className="dsa-page-heading">
          <div><span className="dsa-eyebrow"><Code2 size={14}/> PLACEMENT PREPARATION</span><h1>DSA &amp; coding progress</h1><p>Keep a personal record of problems you’ve worked through and see your topic coverage grow.</p></div>
          <button className="dsa-primary-button" onClick={openCreate}><Plus size={16}/> Add problem</button>
        </header>
        {error && <div className="dsa-alert" role="alert"><span>{error}</span><button onClick={() => loadData()}>Retry</button></div>}
        {notice && <div className="dsa-notice" role="status"><Check size={15}/>{notice}<button aria-label="Dismiss message" onClick={() => setNotice("")}><X size={14}/></button></div>}

        {loading ? <div className="dsa-loading"><LoaderCircle size={19} className="dsa-spin"/> Loading your saved coding activity…</div> : stats && <>
          <section className="dsa-summary-grid" aria-label="DSA progress summary">
            <article className="dsa-summary-card dsa-summary-primary"><span className="dsa-summary-icon"><Target size={18}/></span><div><small>OVERALL DSA PROGRESS</small><strong>{stats.overallProgressPercentage}%</strong><p>{stats.solvedCount} of {stats.solvedBenchmark} unique solved problems</p></div><span className="dsa-summary-progress"><i style={{ width: `${stats.overallProgressPercentage}%` }}/></span></article>
            <SummaryCard icon={Check} label="Solved" value={stats.solvedCount} caption="Unique solved records" tone="green" />
            <SummaryCard icon={Activity} label="Attempted" value={stats.attemptedCount} caption="Not marked as solved" tone="blue" />
            <SummaryCard icon={BookOpen} label="In progress" value={stats.inProgressCount} caption="Currently working on" tone="violet" />
          </section>

          <section className="dsa-dashboard-grid">
            <article className="dsa-panel dsa-difficulty-panel">
              <PanelHeader kicker="SOLVED BY LEVEL" title="Difficulty distribution" icon={BarChart3}/>
              <div className="dsa-difficulty-cards">
                {[["Easy", stats.easySolved, "easy"], ["Medium", stats.mediumSolved, "medium"], ["Hard", stats.hardSolved, "hard"]].map(([label, count, tone]) => <div className={`dsa-difficulty-card ${tone}`} key={label}><span>{label}</span><strong>{count}</strong><small>solved</small></div>)}
              </div>
              <div className="dsa-distribution-note">Difficulty distribution includes all logged records: {enumValues(DSA_DIFFICULTIES).map((difficulty) => `${dsaLabel(difficulty)} ${stats.difficultyDistribution?.[difficulty] || 0}`).join(" · ")}.</div>
            </article>
            <article className="dsa-panel dsa-score-panel">
              <PanelHeader kicker="READINESS CONTRIBUTION" title="DSA readiness score" icon={Target}/>
              <div className="dsa-readiness-number"><strong>{stats.readinessScore}</strong><span>/ 100</span></div>
              <div className="dsa-score-progress"><i style={{ width: `${stats.readinessScore}%` }}/></div>
              <p>This is the DSA component score used by your overall Placement Readiness Score when tracker data is available.</p>
              <details className="dsa-formula-details"><summary><CircleHelp size={14}/> How this score is calculated</summary><p>70% × solved benchmark progress ({stats.solvedCount}/{stats.solvedBenchmark}, capped at 100%) + 30% × topic coverage ({stats.solvedTopicsCount}/{stats.availableTopicCount} topics with at least one solved problem). No solved problems means a DSA score of 0. The 150-problem benchmark is a configurable preparation target, not a placement guarantee.</p></details>
              <button className="dsa-text-link" onClick={() => navigate("/dashboard")}>View overall readiness <ArrowRight size={14}/></button>
            </article>
          </section>

          <section className="dsa-dashboard-grid dsa-topic-layout">
            <article className="dsa-panel dsa-topic-panel">
              <PanelHeader kicker="TOPIC COVERAGE" title="Progress by topic" icon={BookOpen}/>
              {stats.topics?.length ? <div className="dsa-topic-list">{stats.topics.map((topic) => <div className="dsa-topic-row" key={topic.topic}>
                <div className="dsa-topic-title"><strong>{dsaLabel(topic.topic)}</strong><span>{topic.solved} solved · {topic.totalLogged} logged</span></div>
                <div className="dsa-topic-track" role="progressbar" aria-label={`${dsaLabel(topic.topic)} solved among logged problems`} aria-valuenow={topic.progressPercentage} aria-valuemin="0" aria-valuemax="100"><i style={{ width: `${topic.progressPercentage}%` }}/></div>
                <small>{topic.progressPercentage}%</small>
              </div>)}</div> : <EmptyState icon={BookOpen} title="No topic progress yet">Your topic breakdown will appear after you log coding problems.</EmptyState>}
              <p className="dsa-panel-footnote">Topic percentage = solved problems ÷ all logged problems in that topic. No assumed per-topic target.</p>
            </article>
            <article className="dsa-panel dsa-recent-panel">
              <PanelHeader kicker="LATEST UPDATES" title="Recent activity" icon={Activity}/>
              {stats.recentActivity?.length ? <div className="dsa-recent-list">{stats.recentActivity.slice(0, 5).map((problem) => <div className="dsa-recent-row" key={problem.id}><span className={`dsa-recent-mark status-${problem.status.toLowerCase()}`}><Code2 size={14}/></span><div><strong>{problem.title}</strong><small>{dsaLabel(problem.topic)} · {dsaLabel(problem.difficulty)}</small></div><time>{new Date(problem.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</time></div>)}</div> : <EmptyState icon={Activity} title="No activity to show">Problems you add or update will appear here.</EmptyState>}
            </article>
          </section>

          <section className="dsa-panel dsa-problems-panel" aria-labelledby="dsa-problems-title">
            <div className="dsa-problems-heading"><PanelHeader kicker="YOUR SAVED RECORDS" title="Problem log" icon={Code2}/><button className="dsa-secondary-button" onClick={openCreate}><Plus size={15}/> Add problem</button></div>
            <div className="dsa-filter-bar">
              <label className="dsa-search"><Search size={15}/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search problems or notes" aria-label="Search problem name or notes"/></label>
              <FilterSelect label="Topic" value={filters.topic} options={DSA_TOPICS} onChange={(value) => updateFilter("topic", value)}/>
              <FilterSelect label="Difficulty" value={filters.difficulty} options={DSA_DIFFICULTIES} onChange={(value) => updateFilter("difficulty", value)}/>
              <FilterSelect label="Platform" value={filters.platform} options={DSA_PLATFORMS} onChange={(value) => updateFilter("platform", value)}/>
              <FilterSelect label="Status" value={filters.status} options={DSA_STATUSES} onChange={(value) => updateFilter("status", value)}/>
              {hasFilters && <button className="dsa-clear-filters" onClick={clearFilters}><FilterX size={14}/> Clear</button>}
            </div>
            {problems.length === 0 ? <EmptyState icon={Code2} title="Your coding log is ready">Add a problem you’ve worked on to start building a real record of your DSA practice.</EmptyState> : filteredProblems.length === 0 ? <EmptyState icon={Search} title="No problems match these filters">Try a different search or clear one or more filters.</EmptyState> : <div className="dsa-table-wrap"><table className="dsa-problem-table"><thead><tr><th>PROBLEM</th><th>TOPIC</th><th>DIFFICULTY</th><th>PLATFORM</th><th>STATUS</th><th>DATE SOLVED</th><th>ACTIONS</th></tr></thead><tbody>
              {filteredProblems.map((problem) => <tr key={problem.id}><td><div className="dsa-problem-name"><details><summary><strong>{problem.title}</strong></summary><p>{problem.notes || "No notes saved."}</p><small>Time: {problem.timeComplexity || "—"} · Space: {problem.spaceComplexity || "—"}</small></details>{problem.problemUrl && <a href={problem.problemUrl} target="_blank" rel="noopener noreferrer" aria-label={`Open ${problem.title} on coding platform`}><ExternalLink size={12}/></a>}</div></td><td>{dsaLabel(problem.topic)}</td><td><span className={`dsa-pill difficulty-${problem.difficulty.toLowerCase()}`}>{dsaLabel(problem.difficulty)}</span></td><td>{dsaLabel(problem.platform)}</td><td><span className={`dsa-pill status-pill-${problem.status.toLowerCase()}`}>{dsaLabel(problem.status)}</span></td><td>{problem.solvedAt || "—"}</td><td><div className="dsa-row-actions"><button title="Edit problem" aria-label={`Edit ${problem.title}`} onClick={() => openEdit(problem)}><FileEdit size={14}/></button><button title="Delete problem" aria-label={`Delete ${problem.title}`} disabled={deletingId === problem.id} onClick={() => deleteProblem(problem)}>{deletingId === problem.id ? <LoaderCircle className="dsa-spin" size={14}/> : <Trash2 size={14}/>}</button></div></td></tr>)}
            </tbody></table></div>}
            <div className="dsa-record-count">Showing {filteredProblems.length} of {problems.length} problem records</div>
          </section>
        </>}
      </div>
    </main>
    {editor && <div className="dsa-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) setEditor(null); }}><form className="dsa-problem-modal" onSubmit={saveProblem}>
      <div className="dsa-modal-heading"><div><span>CODING PRACTICE LOG</span><h2>{editor.id ? "Edit problem" : "Add a problem"}</h2><p>Keep one record for each problem so your progress stays accurate.</p></div><button type="button" disabled={saving} onClick={() => setEditor(null)} aria-label="Close"><X size={18}/></button></div>
      {error && <p className="dsa-modal-error" role="alert">{error}</p>}
      <div className="dsa-form-grid">
        <label className="dsa-form-wide">Problem title <input required maxLength="180" name="title" value={form.title} onChange={updateForm} placeholder="e.g. Two Sum" autoFocus/></label>
        <label className="dsa-form-wide">Problem URL <input type="url" maxLength="800" name="problemUrl" value={form.problemUrl} onChange={updateForm} placeholder="https://… (optional)"/></label>
        <label>Platform <select name="platform" value={form.platform} onChange={updateForm} required>{DSA_PLATFORMS.map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label>Topic <select name="topic" value={form.topic} onChange={updateForm} required>{DSA_TOPICS.map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label>Difficulty <select name="difficulty" value={form.difficulty} onChange={updateForm} required>{DSA_DIFFICULTIES.map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label>Status <select name="status" value={form.status} onChange={updateForm} required>{DSA_STATUSES.map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        {form.status === "SOLVED" && <label>Date solved <input type="date" name="solvedAt" required max={localToday()} value={form.solvedAt} onChange={updateForm}/></label>}
        <label>Time complexity <input maxLength="80" name="timeComplexity" value={form.timeComplexity} onChange={updateForm} placeholder="e.g. O(n)"/></label>
        <label>Space complexity <input maxLength="80" name="spaceComplexity" value={form.spaceComplexity} onChange={updateForm} placeholder="e.g. O(1)"/></label>
        <label className="dsa-form-wide">Notes or approach <textarea maxLength="3000" rows="3" name="notes" value={form.notes} onChange={updateForm} placeholder="Optional: outline your approach or key insight"/></label>
      </div>
      <div className="dsa-modal-footer"><button type="button" disabled={saving} onClick={() => setEditor(null)}>Cancel</button><button type="submit" disabled={saving}>{saving ? <><LoaderCircle className="dsa-spin" size={15}/> Saving…</> : <><Check size={15}/> {editor.id ? "Save changes" : "Add problem"}</>}</button></div>
    </form></div>}
  </>;
}

function SummaryCard({ icon: Icon, label, value, caption, tone }) {
  return <article className={`dsa-summary-card dsa-summary-${tone}`}><span className="dsa-summary-icon"><Icon size={17}/></span><div><small>{label.toUpperCase()}</small><strong>{value}</strong><p>{caption}</p></div></article>;
}

function PanelHeader({ kicker, title, icon: Icon }) {
  return <div className="dsa-panel-heading"><div><span>{kicker}</span><h2>{title}</h2></div><i><Icon size={17}/></i></div>;
}

function EmptyState({ icon: Icon, title, children }) {
  return <div className="dsa-empty-state"><span><Icon size={19}/></span><strong>{title}</strong><p>{children}</p></div>;
}

function FilterSelect({ label, value, options, onChange }) {
  return <label className="dsa-filter-select"><span>{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} aria-label={`Filter by ${label.toLowerCase()}`}><option value="">All</option>{options.map(([optionValue, optionLabel]) => <option key={optionValue} value={optionValue}>{optionLabel}</option>)}</select><ChevronDown size={13}/></label>;
}

export default DsaTracker;
