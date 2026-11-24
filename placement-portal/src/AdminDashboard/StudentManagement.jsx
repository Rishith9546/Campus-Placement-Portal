import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, BriefcaseBusiness, ChevronLeft, ChevronRight, CircleUserRound, Download, ExternalLink, FileText, FilterX, GraduationCap, Mail, MapPin, Phone, RefreshCw, Search, ShieldCheck, ShieldOff, X } from "lucide-react";
import "./StudentManagement.css";

const API = "http://localhost:8080/api/admin/students";
const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });
const skillsOf = (skills) => (skills || "").split(/[,;|\n]/).map((skill) => skill.trim()).filter(Boolean);
const show = (value) => value === null || value === undefined || value === "" ? "Not provided" : value;

export default function StudentManagement() {
  const [filters, setFilters] = useState({ search: "", branch: "", minCgpa: "", maxCgpa: "", skill: "", accountStatus: "ALL" });
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState({ by: "name", direction: "asc" });
  const [branches, setBranches] = useState([]);
  const [result, setResult] = useState(null);
  const [loadState, setLoadState] = useState("loading");
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [drawerVersion, setDrawerVersion] = useState(0);
  const [confirming, setConfirming] = useState(null);
  const [notice, setNotice] = useState(null);
  const [saving, setSaving] = useState(false);

  const query = useMemo(() => {
    const params = new URLSearchParams({ page: String(page), size: "10", sortBy: sort.by, sortDirection: sort.direction });
    Object.entries(filters).forEach(([key, value]) => { if (value && !(key === "accountStatus" && value === "ALL")) params.set(key, value); });
    return params.toString();
  }, [filters, page, sort]);

  const loadStudents = useCallback(async () => {
    setLoadState("loading"); setError("");
    try {
      const response = await fetch(`${API}?${query}`, { headers: authHeaders() });
      if (!response.ok) throw new Error(await response.text() || "Unable to load students.");
      setResult(await response.json()); setLoadState("ready");
    } catch (err) { setError(err.message || "Unable to load students."); setLoadState("error"); }
  }, [query]);

  useEffect(() => { const timer = setTimeout(loadStudents, filters.search ? 280 : 0); return () => clearTimeout(timer); }, [loadStudents, filters.search]);
  useEffect(() => { fetch(`${API}/branches`, { headers: authHeaders() }).then((response) => response.ok ? response.json() : []).then(setBranches).catch(() => setBranches([])); }, []);

  const changeFilter = (key, value) => { setFilters((current) => ({ ...current, [key]: value })); setPage(0); };
  const clearFilters = () => { setFilters({ search: "", branch: "", minCgpa: "", maxCgpa: "", skill: "", accountStatus: "ALL" }); setPage(0); };
  const changeSort = (by) => { setSort((current) => ({ by, direction: current.by === by && current.direction === "asc" ? "desc" : "asc" })); setPage(0); };
  const hasFilters = Object.entries(filters).some(([key, value]) => key === "accountStatus" ? value !== "ALL" : Boolean(value));

  const submitStatus = async () => {
    if (!confirming) return;
    setSaving(true); setNotice(null);
    try {
      const response = await fetch(`${API}/${confirming.student.id}/status`, { method: "PATCH", headers: { ...authHeaders(), "Content-Type": "application/json" }, body: JSON.stringify({ enabled: confirming.enabled }) });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.message || "Account status could not be updated.");
      setNotice({ kind: "success", message: body.message || "Student account updated." });
      setConfirming(null); await loadStudents();
      if (selectedId === confirming.student.id) setDrawerVersion((value) => value + 1);
    } catch (err) { setNotice({ kind: "error", message: err.message || "Account status could not be updated." }); }
    finally { setSaving(false); }
  };

  const students = result?.content || [];
  const totalPages = result?.totalPages || 0;
  const activeFilterLabels = [
    filters.branch && `Branch: ${filters.branch}`,
    filters.minCgpa && `CGPA ≥ ${filters.minCgpa}`,
    filters.maxCgpa && `CGPA ≤ ${filters.maxCgpa}`,
    filters.skill && `Skill: ${filters.skill}`,
    filters.accountStatus !== "ALL" && `Account: ${filters.accountStatus.toLowerCase()}`,
  ].filter(Boolean);

  return <div className="admin-students-page">
    <header className="admin-students-title"><div><span className="admin-eyebrow">STUDENT DIRECTORY</span><h2>Student management</h2><p>Search student accounts, review profiles, and manage account access. Placement offers and registration dates are not stored in the current database.</p></div><div className="admin-students-total"><GraduationCap size={18} /><span><strong>{loadState === "ready" ? Number(result?.totalStudents || 0).toLocaleString() : "—"}</strong><small>registered students</small></span></div></header>

    {notice && <div className={`admin-student-notice ${notice.kind}`} role="status"><span>{notice.message}</span><button onClick={() => setNotice(null)} aria-label="Dismiss message"><X size={15} /></button></div>}

    <section className="admin-student-filters" aria-label="Search and filter students">
      <label className="admin-student-search"><Search size={17} /><input value={filters.search} onChange={(event) => changeFilter("search", event.target.value)} placeholder="Search name, email, roll number or branch" aria-label="Search students" />{filters.search && <button onClick={() => changeFilter("search", "")} aria-label="Clear search"><X size={15} /></button>}</label>
      <div className="admin-filter-controls">
        <select value={filters.branch} onChange={(event) => changeFilter("branch", event.target.value)} aria-label="Filter by branch"><option value="">All branches</option>{branches.map((branch) => <option key={branch} value={branch}>{branch}</option>)}</select>
        <input type="number" min="0" max="10" step="0.1" value={filters.minCgpa} onChange={(event) => changeFilter("minCgpa", event.target.value)} placeholder="Min CGPA" aria-label="Minimum CGPA" />
        <input type="number" min="0" max="10" step="0.1" value={filters.maxCgpa} onChange={(event) => changeFilter("maxCgpa", event.target.value)} placeholder="Max CGPA" aria-label="Maximum CGPA" />
        <input value={filters.skill} onChange={(event) => changeFilter("skill", event.target.value)} placeholder="Filter by skill" aria-label="Filter by skill" />
        <select value={filters.accountStatus} onChange={(event) => changeFilter("accountStatus", event.target.value)} aria-label="Filter by account status"><option value="ALL">All account statuses</option><option value="ACTIVE">Active</option><option value="INACTIVE">Deactivated</option></select>
        <button className="admin-clear-filters" onClick={clearFilters} disabled={!hasFilters}><FilterX size={15} /> Clear filters</button>
      </div>
      {activeFilterLabels.length > 0 && <div className="admin-active-filters" aria-label="Active filters">{activeFilterLabels.map((label) => <span key={label}>{label}</span>)}</div>}
    </section>

    {loadState === "error" && <div className="admin-students-state error"><strong>Could not load students</strong><p>{error}</p><button onClick={loadStudents}><RefreshCw size={15} /> Retry</button></div>}
    {loadState === "loading" && <div className="admin-students-state"><span className="admin-student-spinner" /><strong>Loading student records</strong><p>Applying search and filters on the server…</p></div>}
    {loadState === "ready" && students.length === 0 && <div className="admin-students-state"><span className="admin-student-empty-icon"><CircleUserRound size={23} /></span><strong>{hasFilters ? "No students match these filters" : "No student accounts found"}</strong><p>{hasFilters ? "Try changing or clearing your search and filters." : "Registered student accounts will appear here."}</p>{hasFilters && <button className="admin-clear-empty" onClick={clearFilters}>Clear filters</button>}</div>}

    {loadState === "ready" && students.length > 0 && <>
      <section className="admin-student-table-panel" aria-label="Students list">
        <div className="admin-student-table-scroll"><table className="admin-student-table"><thead><tr>
          <th><button onClick={() => changeSort("name")}>Student <SortIcon sort={sort} field="name" /></button></th>
          <th><button onClick={() => changeSort("rollNo")}>Academic details <SortIcon sort={sort} field="rollNo" /></button></th>
          <th><button onClick={() => changeSort("cgpa")}>CGPA <SortIcon sort={sort} field="cgpa" /></button></th>
          <th>Skills</th><th>Placement</th><th><button onClick={() => changeSort("enabled")}>Account <SortIcon sort={sort} field="enabled" /></button></th><th>Actions</th>
        </tr></thead><tbody>{students.map((student) => <tr key={student.id}>
          <td><button className="admin-student-identity" onClick={() => setSelectedId(student.id)}>
            {student.profilePhoto ? <img src={`http://localhost:8080/api/student/photo/${encodeURIComponent(student.profilePhoto)}`} alt="" onError={(event) => { event.currentTarget.style.display = "none"; }} /> : <span className="admin-student-avatar">{(student.name || student.email || "S").slice(0, 1).toUpperCase()}</span>}
            <span><strong>{show(student.name)}</strong><small>{student.email}</small></span>
          </button></td>
          <td><strong className="admin-table-main">{show(student.branch)}</strong><small className="admin-table-sub">Roll no. {show(student.rollNo)}</small></td>
          <td><span className="admin-cgpa-value">{student.cgpa === null || student.cgpa === undefined ? "—" : Number(student.cgpa).toFixed(2)}</span></td>
          <td><div className="admin-skill-tags">{skillsOf(student.skills).slice(0, 3).map((skill) => <span key={skill}>{skill}</span>)}{skillsOf(student.skills).length > 3 && <small>+{skillsOf(student.skills).length - 3}</small>}{!student.skills && <small>Not listed</small>}</div></td>
          <td><span className="admin-placement-not-tracked">Not tracked</span></td>
          <td><span className={`admin-account-badge ${student.enabled ? "active" : "inactive"}`}><i />{student.enabled ? "Active" : "Deactivated"}</span></td>
          <td><div className="admin-student-row-actions"><button className="admin-view-student" onClick={() => setSelectedId(student.id)}>View profile</button><button className={`admin-toggle-student ${student.enabled ? "deactivate" : "activate"}`} onClick={() => setConfirming({ student, enabled: !student.enabled })} aria-label={`${student.enabled ? "Deactivate" : "Activate"} ${student.name}`} title={student.enabled ? "Deactivate account" : "Reactivate account"}>{student.enabled ? <ShieldOff size={15} /> : <ShieldCheck size={15} />}</button></div></td>
        </tr>)}</tbody></table></div>
      </section>
      <footer className="admin-student-pagination"><span>Showing <strong>{page * 10 + 1}–{Math.min((page + 1) * 10, result.totalElements)}</strong> of <strong>{Number(result.totalElements).toLocaleString()}</strong> matching students</span><div><button onClick={() => setPage((value) => Math.max(0, value - 1))} disabled={page <= 0} aria-label="Previous page"><ChevronLeft size={17} /> Previous</button><span>Page {page + 1} of {Math.max(totalPages, 1)}</span><button onClick={() => setPage((value) => Math.min(totalPages - 1, value + 1))} disabled={page + 1 >= totalPages} aria-label="Next page">Next <ChevronRight size={17} /></button></div></footer>
    </>}

    {selectedId !== null && <StudentDrawer key={`${selectedId}-${drawerVersion}`} id={selectedId} onClose={() => setSelectedId(null)} onStatus={(student, enabled) => setConfirming({ student, enabled })} />}
    {confirming && <div className="admin-student-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) setConfirming(null); }}><section className="admin-student-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="admin-student-confirm-title">
      <button className="admin-modal-close" onClick={() => setConfirming(null)} aria-label="Close confirmation" disabled={saving}><X size={18} /></button><span className={`admin-confirm-icon ${confirming.enabled ? "activate" : "deactivate"}`}>{confirming.enabled ? <ShieldCheck size={21} /> : <ShieldOff size={21} />}</span>
      <h2 id="admin-student-confirm-title">{confirming.enabled ? "Reactivate student account?" : "Deactivate student account?"}</h2><p>{confirming.enabled ? `${confirming.student.name || "This student"} will be able to sign in and use their account again.` : `${confirming.student.name || "This student"} will no longer be able to log in. Their profile and application history will be preserved.`}</p>
      <div><button className="admin-modal-cancel" onClick={() => setConfirming(null)} disabled={saving}>Cancel</button><button className={`admin-modal-confirm ${confirming.enabled ? "activate" : "deactivate"}`} onClick={submitStatus} disabled={saving}>{saving ? "Updating…" : confirming.enabled ? "Reactivate account" : "Deactivate account"}</button></div>
    </section></div>}
  </div>;
}

function SortIcon({ sort, field }) { return sort.by === field ? (sort.direction === "asc" ? <ArrowUp size={13} /> : <ArrowDown size={13} />) : null; }

function StudentDrawer({ id, onClose, onStatus }) {
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState(null);
  const [tab, setTab] = useState("profile");
  const [error, setError] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [resumeState, setResumeState] = useState("idle");

  useEffect(() => { let alive = true; fetch(`${API}/${id}`, { headers: authHeaders() }).then(async (response) => { if (!response.ok) throw new Error(await response.text()); return response.json(); }).then((data) => alive && setProfile(data)).catch((err) => alive && setError(err.message || "Unable to load student profile.")); return () => { alive = false; }; }, [id]);
  useEffect(() => { if (tab !== "applications" || applications !== null) return; let alive = true; fetch(`${API}/${id}/applications`, { headers: authHeaders() }).then(async (response) => { if (!response.ok) throw new Error(await response.text()); return response.json(); }).then((data) => alive && setApplications(data)).catch((err) => alive && setApplications({ error: err.message || "Could not load applications." })); return () => { alive = false; }; }, [tab, applications, id]);
  useEffect(() => () => { if (resumeUrl) URL.revokeObjectURL(resumeUrl); }, [resumeUrl]);

  const prepareResume = async () => {
    setResumeState("loading");
    try { const response = await fetch(`${API}/${id}/resume`, { headers: authHeaders() }); if (!response.ok) throw new Error(response.status === 404 ? "Resume is unavailable." : "Resume could not be opened."); const url = URL.createObjectURL(await response.blob()); setResumeUrl((previous) => { if (previous) URL.revokeObjectURL(previous); return url; }); setResumeState("ready"); }
    catch (err) { setError(err.message); setResumeState("error"); }
  };

  return <div className="admin-student-drawer-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><aside className="admin-student-drawer" role="dialog" aria-modal="true" aria-label="Student profile details">
    <header className="admin-drawer-header"><div><span className="admin-eyebrow">STUDENT PROFILE</span><button onClick={onClose} aria-label="Close student profile"><X size={19} /></button></div>
      {profile ? <div className="admin-drawer-person">{profile.profilePhoto ? <img src={`http://localhost:8080/api/student/photo/${encodeURIComponent(profile.profilePhoto)}`} alt="" /> : <span className="admin-drawer-avatar">{(profile.name || profile.email || "S").slice(0, 1).toUpperCase()}</span>}<span><h2>{show(profile.name)}</h2><p>{profile.email}</p><span className={`admin-account-badge ${profile.enabled ? "active" : "inactive"}`}><i />{profile.enabled ? "Active account" : "Deactivated"}</span></span></div> : <div className="admin-drawer-loading"><span className="admin-student-spinner" /> Loading profile…</div>}
    </header>
    <nav className="admin-drawer-tabs"><button className={tab === "profile" ? "selected" : ""} onClick={() => setTab("profile")}>Profile</button><button className={tab === "applications" ? "selected" : ""} onClick={() => setTab("applications")}>Applications {profile && <small>{profile.totalApplications}</small>}</button></nav>
    <div className="admin-drawer-content">
      {error && <div className="admin-drawer-error">{error}</div>}
      {!profile && !error && <div className="admin-drawer-loading">Loading student details…</div>}
      {profile && tab === "profile" && <>
        <section className="admin-profile-section"><h3><CircleUserRound size={15} /> Personal information</h3><Info label="Email" value={profile.email} icon={Mail} /><Info label="Phone" value={profile.phone} icon={Phone} /><Info label="Roll number" value={profile.rollNo} icon={GraduationCap} /><Info label="Branch" value={profile.branch} icon={MapPin} /></section>
        <section className="admin-profile-section"><h3><GraduationCap size={15} /> Academics</h3><div className="admin-detail-grid"><Info label="CGPA" value={profile.cgpa === null ? null : Number(profile.cgpa).toFixed(2)} /><Info label="College" value={profile.collegeName} /><Info label="Degree" value={profile.degree} /><Info label="Graduation year" value={profile.graduationYear} /><Info label="Backlogs" value={profile.backlogs} /></div></section>
        <section className="admin-profile-section"><h3><BriefcaseBusiness size={15} /> Skills & links</h3><div className="admin-profile-skills">{skillsOf(profile.skills).length ? skillsOf(profile.skills).map((skill) => <span key={skill}>{skill}</span>) : <p>No skills listed.</p>}</div><div className="admin-profile-links">{[["LinkedIn", profile.linkedInProfile], ["GitHub", profile.githubProfile], ["Portfolio", profile.portfolioUrl]].filter(([, url]) => url).map(([label, url]) => <a key={label} href={url} target="_blank" rel="noreferrer">{label}<ExternalLink size={13} /></a>)}</div></section>
        {profile.profileEntries?.length > 0 && <section className="admin-profile-section"><h3><FileText size={15} /> Projects & experience</h3><div className="admin-career-entries">{profile.profileEntries.map((entry, index) => <article key={`${entry.type}-${entry.title}-${index}`}><span>{entry.type}</span><strong>{entry.title}</strong>{entry.organization && <small>{entry.role ? `${entry.role} · ` : ""}{entry.organization}</small>}{entry.description && <p>{entry.description}</p>}{entry.technologies && <small>{entry.technologies}</small>}</article>)}</div></section>}
        <section className="admin-profile-section"><h3><BriefcaseBusiness size={15} /> Application overview</h3><div className="admin-application-summary"><div><strong>{profile.totalApplications}</strong><small>Total applications</small></div><div><strong>{profile.shortlistedApplications}</strong><small>Shortlisted</small></div><div><strong>{profile.rejectedApplications}</strong><small>Rejected</small></div><div><strong>{profile.selectedApplications}</strong><small>Selected stage</small></div></div><p className="admin-placement-help">Offer acceptance and completed placement are not tracked in the current database.</p></section>
        <section className="admin-profile-section"><h3><FileText size={15} /> Resume</h3>{profile.resumeAvailable ? <div className="admin-resume-actions">{resumeState === "ready" && resumeUrl ? <a href={resumeUrl} target="_blank" rel="noreferrer"><ExternalLink size={15} /> Open resume</a> : <button onClick={prepareResume} disabled={resumeState === "loading"}>{resumeState === "loading" ? <RefreshCw size={15} /> : <Download size={15} />}{resumeState === "loading" ? "Loading resume…" : "View resume"}</button>}</div> : <p className="admin-no-resume">No resume uploaded.</p>}</section>
      </>}
      {tab === "applications" && applications === null && !error && <div className="admin-drawer-loading">Loading application history…</div>}
      {tab === "applications" && applications?.error && <div className="admin-drawer-error">{applications.error}</div>}
      {tab === "applications" && Array.isArray(applications) && (applications.length ? <div className="admin-student-app-list">{applications.map((app) => <article key={app.id}><span className={`admin-application-status ${String(app.status).toLowerCase()}`}>{String(app.status).replaceAll("_", " ")}</span><strong>{show(app.jobTitle)}</strong><small>{show(app.company)}</small><time>{app.appliedAt ? new Date(app.appliedAt).toLocaleString() : "Application date unavailable"}</time></article>)}</div> : <div className="admin-drawer-empty">No applications have been submitted.</div>)}
    </div>
    {profile && <footer className="admin-drawer-footer"><span className={`admin-account-badge ${profile.enabled ? "active" : "inactive"}`}><i />{profile.enabled ? "Account active" : "Account deactivated"}</span><button className={profile.enabled ? "deactivate" : "activate"} onClick={() => onStatus(profile, !profile.enabled)}>{profile.enabled ? <ShieldOff size={15} /> : <ShieldCheck size={15} />}{profile.enabled ? "Deactivate" : "Reactivate"}</button></footer>}
  </aside></div>;
}

function Info({ label, value, icon: Icon }) { return <div className="admin-profile-info">{Icon && <Icon size={14} />}<span><small>{label}</small><strong>{show(value)}</strong></span></div>; }
