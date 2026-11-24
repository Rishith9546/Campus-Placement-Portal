import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowDown, ArrowUp, BriefcaseBusiness, Building2, CalendarDays, Check, CheckCircle2, ChevronLeft, ChevronRight, Clock3, ExternalLink, FilterX, Flag, RefreshCw, Search, ShieldCheck, X, XCircle } from "lucide-react";
import "./AdminJobManagement.css";

const API = "http://localhost:8080/api/admin/jobs";
const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });
const number = (value) => Number(value || 0).toLocaleString();
const pretty = (value) => (value || "").toLowerCase().replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
const date = (value) => value ? new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "Not provided";

export default function AdminJobManagement() {
  const [filters, setFilters] = useState({ search: "", approvalStatus: "", jobStatus: "", jobType: "", location: "", company: "", postedFrom: "", postedTo: "", deadlineFrom: "", deadlineTo: "" });
  const [sort, setSort] = useState({ by: "createdAt", direction: "desc" });
  const [page, setPage] = useState(0);
  const [result, setResult] = useState(null);
  const [state, setState] = useState("loading");
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailState, setDetailState] = useState("idle");
  const [dialog, setDialog] = useState(null);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  const query = useMemo(() => {
    const params = new URLSearchParams({ page: String(page), size: "10", sortBy: sort.by, sortDirection: sort.direction });
    Object.entries(filters).forEach(([key, value]) => { if (value) params.set(key, value); });
    return params.toString();
  }, [filters, page, sort]);

  const load = useCallback(async () => {
    setState("loading"); setError("");
    try {
      const response = await fetch(`${API}?${query}`, { headers: authHeaders() });
      if (!response.ok) throw new Error(await response.text() || "Could not load job records.");
      const data = await response.json();
      if (page > 0 && data.totalPages > 0 && page >= data.totalPages) { setPage(data.totalPages - 1); return; }
      if (page > 0 && data.totalPages === 0) { setPage(0); return; }
      setResult(data); setState("ready");
    } catch (err) { setError(err.message || "Could not load job records."); setState("error"); }
  }, [query, page]);
  useEffect(() => { const timer = setTimeout(load, filters.search ? 280 : 0); return () => clearTimeout(timer); }, [load, filters.search]);

  const loadDetail = useCallback(async (id) => {
    setDetailState("loading");
    try { const response = await fetch(`${API}/${id}`, { headers: authHeaders() }); if (!response.ok) throw new Error(await response.text() || "Could not load job details."); setDetail(await response.json()); setDetailState("ready"); }
    catch (err) { setError(err.message || "Could not load job details."); setDetailState("error"); }
  }, []);
  useEffect(() => { if (selectedId) loadDetail(selectedId); else { setDetail(null); setDetailState("idle"); } }, [selectedId, loadDetail]);

  const setFilter = (key, value) => { setFilters((current) => ({ ...current, [key]: value })); setPage(0); };
  const clearFilters = () => { setFilters({ search: "", approvalStatus: "", jobStatus: "", jobType: "", location: "", company: "", postedFrom: "", postedTo: "", deadlineFrom: "", deadlineTo: "" }); setPage(0); };
  const changeSort = (field) => setSort((current) => ({ by: field, direction: current.by === field && current.direction === "asc" ? "desc" : "asc" }));
  const activeFilters = Object.entries(filters).filter(([, value]) => value).map(([key, value]) => `${pretty(key)}: ${value}`);
  const stats = result?.statistics || {};
  const jobs = result?.content || [];
  const hasFilters = activeFilters.length > 0;

  const performAction = async () => {
    if (!dialog || saving) return;
    if (["reject", "flag"].includes(dialog.action) && !reason.trim()) return;
    setSaving(true); setNotice(null);
    try {
      const body = ["reject", "flag"].includes(dialog.action) ? { reason: reason.trim() } : undefined;
      const response = await fetch(`${API}/${dialog.job.id}/${dialog.action}`, { method: "PATCH", headers: { ...authHeaders(), ...(body ? { "Content-Type": "application/json" } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || "The job action could not be completed.");
      setNotice({ type: "success", message: payload.message || "Job updated." }); setDialog(null); setReason("");
      await load(); if (selectedId === dialog.job.id) await loadDetail(selectedId);
    } catch (err) { setNotice({ type: "error", message: err.message || "The job action could not be completed." }); }
    finally { setSaving(false); }
  };

  const ask = (action, job) => { setReason(""); setDialog({ action, job }); };
  const statCards = [
    ["Total jobs", stats.totalJobs, BriefcaseBusiness, "blue"], ["Pending review", stats.pendingReview, Clock3, "amber"],
    ["Approved", stats.approvedJobs, CheckCircle2, "green"], ["Rejected", stats.rejectedJobs, XCircle, "red"],
    ["Active", stats.activeJobs, ShieldCheck, "teal"], ["Closed", stats.closedJobs, X, "slate"],
    ["Expired", stats.expiredJobs, CalendarDays, "orange"], ["Flagged", stats.flaggedJobs, Flag, "rose"],
  ];
  const closeDialog = () => { if (!saving) { setDialog(null); setReason(""); } };

  return <main className="admin-jobs-page">
    <header className="admin-jobs-heading"><div><span className="admin-eyebrow">POSTING REVIEW & LIFECYCLE</span><h1>Job management</h1><p>Review postings, control visibility, and track moderation using live portal records.</p></div><button className="aj-refresh" onClick={load} disabled={state === "loading"}><RefreshCw size={15}/> Refresh</button></header>
    {notice && <div className={`aj-notice ${notice.type}`} role="status"><span>{notice.message}</span><button onClick={() => setNotice(null)} aria-label="Dismiss"><X size={15}/></button></div>}
    <section className="aj-stat-grid" aria-label="Job statistics">{statCards.map(([label, value, Icon, tone]) => <article className={`aj-stat ${tone}`} key={label}><span className="aj-stat-icon"><Icon size={17}/></span><strong>{number(value)}</strong><small>{label}</small></article>)}</section>
    <section className="aj-filter-panel" aria-label="Search and filter job postings">
      <label className="aj-search"><Search size={17}/><input value={filters.search} onChange={(event) => setFilter("search", event.target.value)} placeholder="Search title, company, recruiter or location" aria-label="Search jobs"/>{filters.search && <button onClick={() => setFilter("search", "")} aria-label="Clear search"><X size={15}/></button>}</label>
      <div className="aj-filters">
        <select value={filters.approvalStatus} onChange={(event) => setFilter("approvalStatus", event.target.value)} aria-label="Approval status"><option value="">All approval statuses</option><option value="PENDING">Pending</option><option value="APPROVED">Approved</option><option value="REJECTED">Rejected</option></select>
        <select value={filters.jobStatus} onChange={(event) => setFilter("jobStatus", event.target.value)} aria-label="Job status"><option value="">All job states</option>{["ACTIVE", "CLOSED", "EXPIRED", "PENDING", "REJECTED", "FLAGGED", "APPROVED"].map((status) => <option key={status} value={status}>{pretty(status)}</option>)}</select>
        <select value={filters.jobType} onChange={(event) => setFilter("jobType", event.target.value)} aria-label="Job type"><option value="">All job types</option>{(result?.jobTypes || []).map((type) => <option key={type} value={type}>{type}</option>)}</select>
        <select value={filters.company} onChange={(event) => setFilter("company", event.target.value)} aria-label="Company"><option value="">All companies</option>{(result?.companies || []).map((company) => <option key={company} value={company}>{company}</option>)}</select>
        <input value={filters.location} onChange={(event) => setFilter("location", event.target.value)} placeholder="Location" aria-label="Filter by location"/>
        <button className="aj-clear" onClick={clearFilters} disabled={!hasFilters}><FilterX size={15}/> Clear filters</button>
      </div>
      <details className="aj-date-filters"><summary><CalendarDays size={14}/> Date filters</summary><div><label>Posted from<input type="date" value={filters.postedFrom} onChange={(event) => setFilter("postedFrom", event.target.value)}/></label><label>Posted to<input type="date" value={filters.postedTo} onChange={(event) => setFilter("postedTo", event.target.value)}/></label><label>Deadline from<input type="date" value={filters.deadlineFrom} onChange={(event) => setFilter("deadlineFrom", event.target.value)}/></label><label>Deadline to<input type="date" value={filters.deadlineTo} onChange={(event) => setFilter("deadlineTo", event.target.value)}/></label></div></details>
      {activeFilters.length > 0 && <div className="aj-active-filters">{activeFilters.map((filter) => <span key={filter}>{filter}</span>)}</div>}
    </section>

    {state === "error" && <div className="aj-state aj-error"><strong>Job data unavailable</strong><p>{error}</p><button onClick={load}><RefreshCw size={14}/> Try again</button></div>}
    {state === "loading" && <div className="aj-state"><span className="aj-spinner"/><strong>Loading job postings</strong><p>Fetching filtered records from the server…</p></div>}
    {state === "ready" && jobs.length === 0 && <div className="aj-state"><span className="aj-empty-icon"><BriefcaseBusiness size={22}/></span><strong>{hasFilters ? "No jobs match these filters" : "No job postings found"}</strong><p>{hasFilters ? "Adjust or clear filters to see other postings." : "New recruiter postings will appear here for review."}</p>{hasFilters && <button onClick={clearFilters}>Clear filters</button>}</div>}
    {state === "ready" && jobs.length > 0 && <section className="aj-table-panel"><div className="aj-table-wrap"><table className="aj-table"><thead><tr><th><Sort label="Job posting" field="title" sort={sort} onSort={changeSort}/></th><th><Sort label="Company" field="company" sort={sort} onSort={changeSort}/></th><th>Recruiter</th><th><Sort label="Posted" field="createdAt" sort={sort} onSort={changeSort}/></th><th>Deadline</th><th>Applications</th><th><Sort label="Status" field="approvalStatus" sort={sort} onSort={changeSort}/></th><th>Actions</th></tr></thead><tbody>{jobs.map((job) => <tr key={job.id}>
      <td><button className="aj-job-identity" onClick={() => setSelectedId(job.id)}><strong>{job.title || "Untitled posting"}</strong><small>{job.jobType || "Type not stored"} · {job.location || "Location not stored"}</small></button></td>
      <td><span className="aj-company"><Building2 size={14}/>{job.company || "Company unavailable"}</span></td><td><span className="aj-recruiter">{job.recruiterName || "Recruiter unavailable"}</span><small className="aj-email">{job.recruiterEmail || ""}</small></td>
      <td>{date(job.createdAt)}</td><td>{date(job.deadline)}</td><td><span className="aj-app-count">{number(job.applications)}</span></td><td><div className="aj-badges"><Badge value={job.approvalStatus}/><Badge value={job.jobStatus}/>{job.moderationFlagged && <Badge value="FLAGGED"/>}</div></td>
      <td><div className="aj-row-actions"><button onClick={() => setSelectedId(job.id)}>Review</button>{job.approvalStatus === "PENDING" && <button className="approve" onClick={() => ask("approve", job)} aria-label={`Approve ${job.title}`}><Check size={14}/></button>}</div></td>
    </tr>)}</tbody></table></div><footer className="aj-pagination"><span>Showing <strong>{jobs.length ? page * (result?.size || 10) + 1 : 0}–{page * (result?.size || 10) + jobs.length}</strong> of <strong>{number(result?.totalElements)}</strong> jobs</span><div><button onClick={() => setPage((value) => Math.max(0, value - 1))} disabled={page === 0} aria-label="Previous page"><ChevronLeft size={17}/></button><span>Page {page + 1} of {Math.max(result?.totalPages || 0, 1)}</span><button onClick={() => setPage((value) => value + 1)} disabled={page + 1 >= (result?.totalPages || 0)} aria-label="Next page"><ChevronRight size={17}/></button></div></footer></section>}

    {selectedId && <div className="aj-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedId(null); }}><aside className="aj-drawer" aria-label="Job review details"><header><div><span className="admin-eyebrow">JOB REVIEW</span><h2>{detail?.title || "Job details"}</h2></div><button className="aj-icon-button" onClick={() => setSelectedId(null)} aria-label="Close details"><X size={18}/></button></header>
      {detailState === "loading" && <div className="aj-drawer-state"><span className="aj-spinner"/>Loading posting details…</div>}
      {detailState === "error" && <div className="aj-drawer-state aj-error"><p>{error}</p><button onClick={() => loadDetail(selectedId)}>Retry</button></div>}
      {detailState === "ready" && detail && <div className="aj-drawer-body"><div className="aj-detail-badges"><Badge value={detail.approvalStatus}/><Badge value={detail.jobStatus}/>{detail.moderationFlagged && <Badge value="FLAGGED"/>}</div>
        <section className="aj-detail-section"><h3><Building2 size={15}/> Recruiter & company</h3><div className="aj-detail-grid"><Detail label="Company" value={detail.company}/><Detail label="Recruiter" value={detail.recruiterName}/><Detail label="Recruiter email" value={detail.recruiterEmail}/><Detail label="Portal company review" value={detail.recruiterVerificationStatus ? pretty(detail.recruiterVerificationStatus) : "Not available"}/></div></section>
        <section className="aj-detail-section"><h3><BriefcaseBusiness size={15}/> Posting details</h3><div className="aj-detail-grid"><Detail label="Job type" value={detail.jobType}/><Detail label="Location" value={detail.location}/><Detail label="Salary / package" value={detail.salary}/><Detail label="Posted" value={date(detail.createdAt)}/><Detail label="Application deadline" value={date(detail.deadline)}/></div><TextDetail label="Description" value={detail.description}/><TextDetail label="Responsibilities" value={detail.responsibilities}/><TextDetail label="Eligibility criteria" value={detail.eligibility}/><TextDetail label="Required skills" value={detail.skills}/></section>
        <section className="aj-detail-section"><h3><CheckCircle2 size={15}/> Application activity</h3><div className="aj-application-stats"><Detail label="Total applications" value={number(detail.totalApplications)}/>{Object.entries(detail.applicationStatuses || {}).map(([status, count]) => <Detail key={status} label={pretty(status)} value={number(count)}/>)}</div></section>
        {detail.rejectionReason && <div className="aj-reason-block rejected"><strong>Rejection reason</strong><p>{detail.rejectionReason}</p></div>}{detail.moderationReason && <div className="aj-reason-block flagged"><strong>Moderation note</strong><p>{detail.moderationReason}</p></div>}
        <section className="aj-detail-actions"><h3>Admin actions</h3><div>{detail.approvalStatus === "PENDING" && <button className="primary" onClick={() => ask("approve", detail)}><Check size={15}/> Approve job</button>}{detail.approvalStatus !== "REJECTED" && <button className="danger" onClick={() => ask("reject", detail)}><XCircle size={15}/> Reject</button>}{detail.approvalStatus === "REJECTED" && <button onClick={() => ask("review", detail)}><RefreshCw size={15}/> Return to review</button>}{detail.approvalStatus === "APPROVED" && !detail.closed && <button onClick={() => ask("close", detail)}><X size={15}/> Close job</button>}{detail.closed && <button onClick={() => ask("reopen", detail)}><RefreshCw size={15}/> Reopen job</button>}{!detail.moderationFlagged ? <button className="flag" onClick={() => ask("flag", detail)}><Flag size={15}/> Flag for review</button> : <button onClick={() => ask("unflag", detail)}><CheckCircle2 size={15}/> Remove flag</button>}</div><p>Approval controls student visibility. Existing applications and recruiter records are preserved.</p></section>
      </div>}
    </aside></div>}

    {dialog && <div className="aj-modal-overlay"><section className="aj-modal" role="dialog" aria-modal="true" aria-labelledby="aj-dialog-title"><button className="aj-modal-close" onClick={closeDialog} aria-label="Close dialog"><X size={17}/></button><span className={`aj-modal-mark ${["reject", "flag"].includes(dialog.action) ? "caution" : ""}`}>{["reject", "flag"].includes(dialog.action) ? <AlertTriangle size={21}/> : <CheckCircle2 size={21}/>}</span><h2 id="aj-dialog-title">{dialogTitle(dialog.action)}</h2><p>{dialogDescription(dialog.action, dialog.job)}</p>{["reject", "flag"].includes(dialog.action) && <label className="aj-reason-input">{dialog.action === "reject" ? "Reason for rejection" : "Reason for moderation flag"}<textarea maxLength={1000} rows={4} value={reason} onChange={(event) => setReason(event.target.value)} placeholder={dialog.action === "reject" ? "Explain what needs to change before approval…" : "Describe the concern that needs investigation…"}/><small>{reason.trim().length}/1000 characters. A reason is required.</small></label>}<div className="aj-modal-actions"><button className="secondary" onClick={closeDialog} disabled={saving}>Cancel</button><button className={dialog.action === "reject" ? "danger" : "primary"} onClick={performAction} disabled={saving || (["reject", "flag"].includes(dialog.action) && !reason.trim())}>{saving ? "Saving…" : dialogConfirm(dialog.action)}</button></div></section></div>}
  </main>;
}

function Sort({ label, field, sort, onSort }) { return <button className="aj-sort" onClick={() => onSort(field)}>{label}{sort.by === field ? sort.direction === "asc" ? <ArrowUp size={13}/> : <ArrowDown size={13}/> : null}</button>; }
function Badge({ value }) { return <span className={`aj-badge ${String(value || "unknown").toLowerCase()}`}>{pretty(value) || "Unknown"}</span>; }
function Detail({ label, value }) { return <div className="aj-detail"><small>{label}</small><strong>{value === null || value === undefined || value === "" ? "Not stored" : value}</strong></div>; }
function TextDetail({ label, value }) { return <div className="aj-text-detail"><small>{label}</small><p>{value || "Not provided"}</p></div>; }
function dialogTitle(action) { return ({ approve: "Approve this job?", reject: "Reject this job?", review: "Return job to review?", close: "Close this job?", reopen: "Reopen this job?", flag: "Flag this job for review?", unflag: "Remove moderation flag?" })[action]; }
function dialogDescription(action, job) { return ({ approve: `“${job.title || "This posting"}” will become visible to students while it remains active and within its deadline.`, reject: `“${job.title || "This posting"}” will be hidden from students. The reason will be saved for Admin review.`, review: `“${job.title || "This posting"}” will return to the pending review queue.`, close: `“${job.title || "This posting"}” will stop accepting applications. Existing applications are kept.`, reopen: `“${job.title || "This posting"}” will accept applications again if the deadline is still valid.`, flag: `“${job.title || "This posting"}” will be marked as requiring Admin investigation and hidden from students.`, unflag: `The moderation marker will be removed from “${job.title || "this posting"}”.` })[action]; }
function dialogConfirm(action) { return ({ approve: "Approve job", reject: "Reject job", review: "Return to review", close: "Close job", reopen: "Reopen job", flag: "Flag job", unflag: "Remove flag" })[action]; }
