import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, BriefcaseBusiness, Building2, Check, CheckCircle2, ChevronLeft, ChevronRight, CircleUserRound, Clock3, ExternalLink, FilterX, RefreshCw, Search, ShieldCheck, ShieldOff, X, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import "./RecruiterManagement.css";

const API = "http://localhost:8080/api/admin/recruiters";
const headers = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });
const verificationLabels = { PENDING: "Pending review", VERIFIED: "Reviewed", REJECTED: "Rejected" };
const display = (value) => value === null || value === undefined || value === "" ? "Not stored" : value;

export default function RecruiterManagement() {
  const [filters, setFilters] = useState({ search: "", verificationStatus: "ALL", accountStatus: "ALL", company: "" });
  const [companies, setCompanies] = useState([]);
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState({ by: "name", direction: "asc" });
  const [result, setResult] = useState(null);
  const [state, setState] = useState("loading");
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [drawerVersion, setDrawerVersion] = useState(0);
  const [confirming, setConfirming] = useState(null);
  const [notice, setNotice] = useState(null);
  const [saving, setSaving] = useState(false);

  const query = useMemo(() => {
    const params = new URLSearchParams({ page: String(page), size: "10", sortBy: sort.by, sortDirection: sort.direction });
    Object.entries(filters).forEach(([key, value]) => { if (value && !((key === "verificationStatus" || key === "accountStatus") && value === "ALL")) params.set(key, value); });
    return params.toString();
  }, [filters, page, sort]);

  const load = useCallback(async () => {
    setState("loading"); setError("");
    try { const response = await fetch(`${API}?${query}`, { headers: headers() }); if (!response.ok) throw new Error(await response.text() || "Could not load recruiter records."); const data = await response.json(); if (page > 0 && data.totalPages > 0 && page >= data.totalPages) { setPage(data.totalPages - 1); return; } if (page > 0 && data.totalPages === 0) { setPage(0); return; } setResult(data); setState("ready"); }
    catch (err) { setError(err.message || "Could not load recruiter records."); setState("error"); }
  }, [query, page]);

  useEffect(() => { const timer = setTimeout(load, filters.search ? 280 : 0); return () => clearTimeout(timer); }, [load, filters.search]);
  useEffect(() => { fetch(`${API}/companies`, { headers: headers() }).then((response) => response.ok ? response.json() : []).then(setCompanies).catch(() => setCompanies([])); }, []);

  const setFilter = (key, value) => { setFilters((current) => ({ ...current, [key]: value })); setPage(0); };
  const clearFilters = () => { setFilters({ search: "", verificationStatus: "ALL", accountStatus: "ALL", company: "" }); setPage(0); };
  const sortBy = (field) => setSort((current) => ({ by: field, direction: current.by === field && current.direction === "asc" ? "desc" : "asc" }));
  const activeFilters = [filters.search && `Search: ${filters.search}`, filters.verificationStatus !== "ALL" && `Review: ${verificationLabels[filters.verificationStatus]}`, filters.accountStatus !== "ALL" && `Account: ${filters.accountStatus.toLowerCase()}`, filters.company && `Company: ${filters.company}`].filter(Boolean);
  const hasFilters = Boolean(filters.search || activeFilters.length);
  const recruiters = result?.content || [];
  const stats = result?.stats || {};
  const pages = result?.totalPages || 0;

  const sendAction = async () => {
    if (!confirming) return;
    setSaving(true); setNotice(null);
    try {
      const isVerification = confirming.action === "verification";
      const response = await fetch(`${API}/${confirming.recruiter.id}/${isVerification ? "verification" : "status"}`, {
        method: "PATCH", headers: { ...headers(), "Content-Type": "application/json" },
        body: JSON.stringify(isVerification ? { status: confirming.value } : { enabled: confirming.value }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || "Could not update recruiter.");
      setNotice({ type: "success", message: payload.message || "Recruiter updated." }); setConfirming(null); await load();
      if (selectedId === confirming.recruiter.id) setDrawerVersion((version) => version + 1);
    } catch (err) { setNotice({ type: "error", message: err.message || "Could not update recruiter." }); }
    finally { setSaving(false); }
  };

  return <div className="admin-recruiters-page">
    <header className="admin-recruiters-heading"><div><span className="admin-eyebrow">RECRUITER DIRECTORY</span><h2>Recruiters & companies</h2><p>Review recruiter portal profiles, account access, and hiring activity. Review status is internal to this portal.</p></div><Link to="/admin/jobs" className="admin-recruiter-jobs-link"><BriefcaseBusiness size={15} /> Job management <ExternalLink size={13} /></Link></header>

    {notice && <div className={`admin-recruiter-notice ${notice.type}`} role="status"><span>{notice.message}</span><button onClick={() => setNotice(null)} aria-label="Dismiss message"><X size={15} /></button></div>}

    <section className="admin-recruiter-stat-grid" aria-label="Recruiter statistics">
      <Stat label="Total recruiters" value={stats.totalRecruiters} icon={CircleUserRound} tone="blue" />
      <Stat label="Reviewed" value={stats.verifiedRecruiters} icon={CheckCircle2} tone="green" />
      <Stat label="Pending review" value={stats.pendingVerification} icon={Clock3} tone="amber" />
      <Stat label="Rejected review" value={stats.rejectedVerification} icon={XCircle} tone="red" />
      <Stat label="Active accounts" value={stats.activeRecruiters} icon={ShieldCheck} tone="green" />
      <Stat label="Inactive accounts" value={stats.inactiveRecruiters} icon={ShieldOff} tone="slate" />
    </section>

    <section className="admin-recruiter-filter-panel" aria-label="Search and filter recruiters">
      <label className="admin-recruiter-search"><Search size={17} /><input value={filters.search} onChange={(event) => setFilter("search", event.target.value)} placeholder="Search recruiter, email or company" aria-label="Search recruiters" />{filters.search && <button onClick={() => setFilter("search", "")} aria-label="Clear search"><X size={15} /></button>}</label>
      <div className="admin-recruiter-controls">
        <select value={filters.verificationStatus} onChange={(event) => setFilter("verificationStatus", event.target.value)} aria-label="Filter verification status"><option value="ALL">All review statuses</option><option value="PENDING">Pending review</option><option value="VERIFIED">Reviewed</option><option value="REJECTED">Rejected</option></select>
        <select value={filters.accountStatus} onChange={(event) => setFilter("accountStatus", event.target.value)} aria-label="Filter account status"><option value="ALL">All account statuses</option><option value="ACTIVE">Active</option><option value="INACTIVE">Deactivated</option></select>
        <select value={filters.company} onChange={(event) => setFilter("company", event.target.value)} aria-label="Filter company"><option value="">All companies</option>{companies.map((company) => <option key={company} value={company}>{company}</option>)}</select>
        <button className="admin-recruiter-clear" onClick={clearFilters} disabled={!hasFilters}><FilterX size={15} /> Clear filters</button>
      </div>
      {activeFilters.length > 0 && <div className="admin-recruiter-active-filters">{activeFilters.map((filter) => <span key={filter}>{filter}</span>)}</div>}
    </section>

    {state === "error" && <div className="admin-recruiter-state error"><strong>Recruiter data unavailable</strong><p>{error}</p><button onClick={load}><RefreshCw size={14} /> Try again</button></div>}
    {state === "loading" && <div className="admin-recruiter-state"><span className="admin-recruiter-spinner" /><strong>Loading recruiter directory</strong><p>Fetching filtered records from the server…</p></div>}
    {state === "ready" && recruiters.length === 0 && <div className="admin-recruiter-state"><span className="admin-recruiter-empty-icon"><Building2 size={22} /></span><strong>{hasFilters ? "No recruiters match your filters" : "No recruiter accounts found"}</strong><p>{hasFilters ? "Adjust or clear the selected filters to see more results." : "Recruiter accounts will appear here when registered."}</p>{hasFilters && <button className="admin-recruiter-clear-empty" onClick={clearFilters}>Clear filters</button>}</div>}

    {state === "ready" && recruiters.length > 0 && <>
      <section className="admin-recruiter-table-panel"><div className="admin-recruiter-table-wrap"><table className="admin-recruiter-table"><thead><tr>
        <th><SortButton label="Recruiter" field="name" sort={sort} onClick={sortBy} /></th><th><SortButton label="Company" field="companyName" sort={sort} onClick={sortBy} /></th><th><SortButton label="Portal review" field="verificationStatus" sort={sort} onClick={sortBy} /></th><th><SortButton label="Account" field="enabled" sort={sort} onClick={sortBy} /></th><th>Jobs posted</th><th>Actions</th>
      </tr></thead><tbody>{recruiters.map((recruiter) => <tr key={recruiter.id}>
        <td><button className="admin-recruiter-identity" onClick={() => setSelectedId(recruiter.id)}><span className="admin-company-avatar">{(recruiter.companyName || recruiter.name || "C").slice(0, 1).toUpperCase()}</span><span><strong>{recruiter.name || "Name unavailable"}</strong><small>{recruiter.email}</small></span></button></td>
        <td><div className="admin-recruiter-company"><Building2 size={14} /><span>{display(recruiter.companyName)}</span></div></td>
        <td><VerificationBadge status={recruiter.verificationStatus} /></td>
        <td><AccountBadge enabled={recruiter.enabled} /></td>
        <td><span className="admin-recruiter-jobs-count">{Number(recruiter.totalJobs || 0).toLocaleString()}</span></td>
        <td><div className="admin-recruiter-actions"><button className="admin-recruiter-view" onClick={() => setSelectedId(recruiter.id)}>View details</button><button className={`admin-recruiter-toggle ${recruiter.enabled ? "deactivate" : "activate"}`} onClick={() => setConfirming({ recruiter, action: "status", value: !recruiter.enabled })} aria-label={`${recruiter.enabled ? "Deactivate" : "Reactivate"} recruiter ${recruiter.name}`} title={recruiter.enabled ? "Deactivate account" : "Reactivate account"}>{recruiter.enabled ? <ShieldOff size={14} /> : <ShieldCheck size={14} />}</button></div></td>
      </tr>)}</tbody></table></div></section>
      <footer className="admin-recruiter-pagination"><span>Showing <strong>{page * 10 + 1}–{Math.min((page + 1) * 10, result.totalElements)}</strong> of <strong>{Number(result.totalElements).toLocaleString()}</strong> recruiters</span><div><button onClick={() => setPage((current) => Math.max(0, current - 1))} disabled={page <= 0}><ChevronLeft size={16} /> Previous</button><span>Page {page + 1} of {Math.max(pages, 1)}</span><button onClick={() => setPage((current) => Math.min(pages - 1, current + 1))} disabled={page + 1 >= pages}>Next <ChevronRight size={16} /></button></div></footer>
    </>}

    {selectedId !== null && <RecruiterDrawer key={`${selectedId}-${drawerVersion}`} id={selectedId} onClose={() => setSelectedId(null)} onAction={(recruiter, action, value) => setConfirming({ recruiter, action, value })} />}
    {confirming && <ConfirmDialog action={confirming} saving={saving} onCancel={() => !saving && setConfirming(null)} onConfirm={sendAction} />}
  </div>;
}

function Stat({ label, value, icon: Icon, tone }) { return <article className={`admin-recruiter-stat ${tone}`}><span><Icon size={17} /></span><strong>{value === undefined ? "—" : Number(value).toLocaleString()}</strong><small>{label}</small></article>; }
function SortButton({ label, field, sort, onClick }) { return <button onClick={() => onClick(field)}>{label}{sort.by === field && (sort.direction === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}</button>; }
function VerificationBadge({ status }) { const normalized = status || "PENDING"; return <span className={`admin-review-badge ${normalized.toLowerCase()}`}><i />{verificationLabels[normalized] || normalized}</span>; }
function AccountBadge({ enabled }) { return <span className={`admin-recruiter-account ${enabled ? "active" : "inactive"}`}><i />{enabled ? "Active" : "Deactivated"}</span>; }

function RecruiterDrawer({ id, onClose, onAction }) {
  const [details, setDetails] = useState(null);
  const [jobs, setJobs] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => { let alive = true; Promise.all([fetch(`${API}/${id}`, { headers: headers() }), fetch(`${API}/${id}/jobs`, { headers: headers() })]).then(async ([profileResponse, jobsResponse]) => { if (!profileResponse.ok) throw new Error(await profileResponse.text() || "Could not load recruiter details."); if (!jobsResponse.ok) throw new Error(await jobsResponse.text() || "Could not load recruiter jobs."); return Promise.all([profileResponse.json(), jobsResponse.json()]); }).then(([profile, jobData]) => { if (alive) { setDetails(profile); setJobs(jobData); } }).catch((err) => alive && setError(err.message || "Could not load recruiter details.")); return () => { alive = false; }; }, [id]);

  return <div className="admin-recruiter-drawer-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><aside className="admin-recruiter-drawer" role="dialog" aria-modal="true" aria-label="Recruiter and company details">
    <header className="admin-recruiter-drawer-header"><div><span className="admin-eyebrow">RECRUITER PROFILE</span><button onClick={onClose} aria-label="Close recruiter profile"><X size={19} /></button></div>
      {details ? <div className="admin-recruiter-person"><span className="admin-company-avatar large">{(details.companyName || details.name || "C").slice(0, 1).toUpperCase()}</span><span><h2>{display(details.companyName)}</h2><p>{details.name} · {details.email}</p><div><VerificationBadge status={details.verificationStatus} /><AccountBadge enabled={details.enabled} /></div></span></div> : <div className="admin-recruiter-drawer-loading"><span className="admin-recruiter-spinner" /> Loading recruiter…</div>}
    </header>
    <div className="admin-recruiter-drawer-body">
      {error && <div className="admin-recruiter-drawer-error">{error}</div>}
      {details && <>
        <section className="admin-recruiter-detail-section"><h3><CircleUserRound size={15} /> Recruiter account</h3><Detail label="Recruiter name" value={details.name} /><Detail label="Email" value={details.email} /><Detail label="Phone" value={details.phone} /><Detail label="Registration date" value={details.createdAt} /><Detail label="Account" value={details.enabled ? "Active" : "Deactivated"} /></section>
        <section className="admin-recruiter-detail-section"><h3><Building2 size={15} /> Company information</h3><Detail label="Company name" value={details.companyName} /><Detail label="Website" value={details.companyWebsite} /><Detail label="Location" value={details.companyLocation} /><Detail label="Description" value={details.companyDescription} /><Detail label="Industry" value={details.industry} /><Detail label="Company size" value={details.companySize} /><p className="admin-recruiter-schema-note">The current recruiter schema stores only a company name; other company profile fields are not collected. “Reviewed” is an internal portal review status, not external legal verification.</p></section>
        <section className="admin-recruiter-detail-section"><h3><BriefcaseBusiness size={15} /> Hiring activity</h3><div className="admin-hiring-stats"><div><strong>{details.totalJobs}</strong><small>Total jobs</small></div><div><strong>{details.activeJobs}</strong><small>Active</small></div><div><strong>{details.closedJobs}</strong><small>Closed</small></div><div><strong>{details.totalApplications}</strong><small>Applications</small></div></div>
          {jobs === null ? <div className="admin-recruiter-inline-loading">Loading jobs…</div> : jobs.recentJobs?.length ? <div className="admin-recruiter-job-list">{jobs.recentJobs.map((job) => <article key={job.id}><span className={`admin-job-state ${job.status.toLowerCase()}`}>{job.status === "ACTIVE" ? "Active" : "Closed"}</span><strong>{job.title || "Untitled job"}</strong><small>{job.company || "Company unavailable"} · {job.jobType || "Type not specified"}</small><div><span>{job.createdAt ? `Posted ${new Date(job.createdAt).toLocaleDateString()}` : "Posted date unavailable"}</span><span>Deadline {job.deadline || "Not set"}</span><span>{job.applications} applications</span></div></article>)}</div> : <div className="admin-recruiter-no-jobs">No jobs have been posted by this recruiter.</div>}
          <Link to="/admin/jobs" className="admin-open-jobs-placeholder">Open Job Management <ExternalLink size={13} /></Link>
        </section>
        <section className="admin-recruiter-detail-section"><h3><ShieldCheck size={15} /> Portal review</h3><p className="admin-review-disclaimer">Review status records an Admin’s review of the profile. It is not external company identity verification.</p><div className="admin-review-actions"><button onClick={() => onAction(details, "verification", "VERIFIED")} disabled={details.verificationStatus === "VERIFIED"}><Check size={14} /> Mark reviewed</button><button onClick={() => onAction(details, "verification", "REJECTED")} disabled={details.verificationStatus === "REJECTED"}><XCircle size={14} /> Reject review</button><button onClick={() => onAction(details, "verification", "PENDING")} disabled={details.verificationStatus === "PENDING"}><Clock3 size={14} /> Return to pending</button></div></section>
      </>}
    </div>
    {details && <footer className="admin-recruiter-drawer-footer"><AccountBadge enabled={details.enabled} /><button className={details.enabled ? "deactivate" : "activate"} onClick={() => onAction(details, "status", !details.enabled)}>{details.enabled ? <ShieldOff size={14} /> : <ShieldCheck size={14} />}{details.enabled ? "Deactivate recruiter" : "Reactivate recruiter"}</button></footer>}
  </aside></div>;
}

function Detail({ label, value }) { return <div className="admin-recruiter-detail"><small>{label}</small><strong>{display(value)}</strong></div>; }

function ConfirmDialog({ action, saving, onCancel, onConfirm }) {
  const verification = action.action === "verification";
  const verb = verification ? ({ VERIFIED: "Mark as reviewed", REJECTED: "Reject review", PENDING: "Return to pending" }[action.value]) : (action.value ? "Reactivate account" : "Deactivate account");
  const summary = verification
    ? `${action.recruiter.companyName || action.recruiter.name} will be marked ${action.value.toLowerCase()}. This records an internal portal review only.`
    : action.value ? `${action.recruiter.name} will regain access to the recruiter portal.` : `${action.recruiter.name} will no longer be able to log in. Their jobs and application records will be preserved.`;
  return <div className="admin-recruiter-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onCancel(); }}><section className="admin-recruiter-confirm" role="dialog" aria-modal="true" aria-labelledby="admin-recruiter-confirm-title">
    <button className="admin-recruiter-modal-close" onClick={onCancel} aria-label="Close dialog" disabled={saving}><X size={17} /></button><span className={`admin-recruiter-confirm-icon ${verification ? "review" : action.value ? "activate" : "deactivate"}`}>{verification ? <ShieldCheck size={21} /> : action.value ? <ShieldCheck size={21} /> : <ShieldOff size={21} />}</span>
    <h2 id="admin-recruiter-confirm-title">{verb}?</h2><p>{summary}</p><div><button onClick={onCancel} disabled={saving}>Cancel</button><button className={verification && action.value === "REJECTED" || !verification && !action.value ? "danger" : "primary"} onClick={onConfirm} disabled={saving}>{saving ? "Saving…" : verb}</button></div>
  </section></div>;
}
