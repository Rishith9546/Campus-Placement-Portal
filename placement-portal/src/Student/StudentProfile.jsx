import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, Award, BriefcaseBusiness, Check, Code2, ExternalLink, FileText, GraduationCap, Link2, LoaderCircle, Pencil, Plus, Save, Trash2, UserRound, X } from "lucide-react";
import { Headers } from "./Headers.jsx";
import "./StudentProfile.css";
import { getProfileCompletion } from "./Functions/placementReadiness.js";

const API = "http://localhost:8080/api";
const apiErrorMessage = (error, fallback) => {
  const body = error?.response?.data;
  if (typeof body === "string" && body.trim()) return body.trim();
  const detail = body?.detail || body?.message || body?.title;
  if (detail) return detail;
  if (body?.error || body?.status) return [body.status, body.error, body.path].filter(Boolean).join(" · ");
  if (!error?.response) return error?.code === "ECONNABORTED"
    ? "Resume analysis timed out. Check the backend log and retry."
    : "Could not reach the server. Check that the backend is running and retry.";
  return fallback;
};
const blankEntry = { type: "PROJECT", title: "", organization: "", role: "", description: "", technologies: "", repositoryUrl: "", liveUrl: "", credentialUrl: "", startDate: "", endDate: "", issueDate: "" };

function StudentProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [draft, setDraft] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [entryEditor, setEntryEditor] = useState(null);
  const [entryForm, setEntryForm] = useState(blankEntry);
  const [entrySaving, setEntrySaving] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [analyzerOpen, setAnalyzerOpen] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [analyzing, setAnalyzing] = useState(false);

  const auth = useMemo(() => ({ Authorization: `Bearer ${localStorage.getItem("token")}` }), []);
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [profileResponse, entriesResponse] = await Promise.all([
        axios.get(`${API}/student/profile`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }),
        axios.get(`${API}/student/profile/entries`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } })
      ]);
      setProfile(profileResponse.data);
      setDraft(profileResponse.data);
      setEntries(Array.isArray(entriesResponse.data) ? entriesResponse.data : []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Your profile could not be loaded. Please refresh and try again.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const completion = getProfileCompletion(profile).percentage;
  const updateDraft = (event) => setDraft((current) => ({ ...current, [event.target.name]: event.target.type === "checkbox" ? event.target.checked : event.target.value }));

  const saveProfile = async (event) => {
    event.preventDefault();
    if (!draft.phone?.trim() || !draft.rollNo?.trim() || !draft.branch?.trim() || !draft.collegeName?.trim() || !draft.degree?.trim() || !draft.graduationYear || draft.cgpa === "" || draft.cgpa == null || !draft.skills?.trim()) {
      setError("Complete the required personal, academic, and skills fields before saving.");
      return;
    }
    if (Number(draft.cgpa) < 0 || Number(draft.cgpa) > 10 || Number(draft.backlogs || 0) < 0) {
      setError("Enter a CGPA from 0 to 10 and a non-negative backlog count.");
      return;
    }
    setSaving(true); setError(""); setNotice("");
    try {
      const result = await axios.post(`${API}/student/profile`, draft, { headers: { ...auth, "Content-Type": "application/json" } });
      setProfile(result.data); setDraft(result.data); setNotice("Profile saved successfully.");
    } catch (requestError) { setError(requestError.response?.data?.message || "Your profile could not be saved."); }
    finally { setSaving(false); }
  };

  const saveAcademicDetails = async () => {
    const academicRequired = [draft?.collegeName, draft?.rollNo, draft?.branch, draft?.degree, draft?.graduationYear, draft?.cgpa];
    if (academicRequired.some((value) => value === null || value === undefined || String(value).trim() === "")) {
      setError("Complete your college, roll number, branch, degree, graduation year, and CGPA before saving academic details.");
      return;
    }
    const cgpa = Number(draft.cgpa);
    const year = Number(draft.graduationYear);
    const backlogs = draft.backlogs === "" || draft.backlogs == null ? null : Number(draft.backlogs);
    if (!Number.isFinite(cgpa) || cgpa < 0 || cgpa > 10 || !Number.isInteger(year) || year < 2000 || year > 2100 || (backlogs !== null && (!Number.isInteger(backlogs) || backlogs < 0 || backlogs > 100))) {
      setError("Enter a CGPA from 0 to 10, a valid graduation year, and a non-negative whole backlog count.");
      return;
    }
    setSaving(true); setError(""); setNotice("");
    try {
      const result = await axios.put(`${API}/student/profile/academic`, {
        collegeName: draft.collegeName.trim(), rollNo: draft.rollNo.trim(), branch: draft.branch.trim(),
        degree: draft.degree.trim(), graduationYear: year, cgpa, backlogs
      }, { headers: { ...auth, "Content-Type": "application/json" } });
      setProfile(result.data); setDraft(result.data); setNotice("Academic details saved successfully.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Academic details could not be saved. Please try again.");
    } finally { setSaving(false); }
  };

  const uploadPhoto = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) { setError("Choose an image under 5 MB."); event.target.value = ""; return; }
    const form = new FormData(); form.append("photo", file); setPhotoUploading(true); setError("");
    try {
      const result = await axios.post(`${API}/student/photo`, form, { headers: auth });
      setProfile((current) => ({ ...current, profilePhoto: result.data.profilePhoto }));
      setDraft((current) => ({ ...current, profilePhoto: result.data.profilePhoto })); setNotice("Profile photo updated.");
    } catch (requestError) { setError(requestError.response?.data?.message || "Photo upload failed."); }
    finally { setPhotoUploading(false); event.target.value = ""; }
  };

  const uploadResume = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf" || !file.name.toLowerCase().endsWith(".pdf") || file.size > 5 * 1024 * 1024) { setError("Choose a PDF resume under 5 MB."); event.target.value = ""; return; }
    const form = new FormData(); form.append("resume", file); setResumeUploading(true); setError("");
    try {
      const result = await axios.post(`${API}/student/resume`, form, { headers: auth });
      setProfile((current) => ({ ...current, resume: result.data.resume }));
      setDraft((current) => ({ ...current, resume: result.data.resume })); setNotice("Resume uploaded successfully.");
    } catch (requestError) { setError(requestError.response?.data?.message || "Resume upload failed."); }
    finally { setResumeUploading(false); event.target.value = ""; }
  };

  const viewResume = async () => {
    try {
      const result = await axios.get(`${API}/student/resume/${encodeURIComponent(profile.resume)}`, { headers: auth, responseType: "blob" });
      const url = URL.createObjectURL(result.data); window.open(url, "_blank", "noopener,noreferrer"); setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch { setError("Could not open the uploaded resume."); }
  };

  const openEntryEditor = (type, entry = null) => {
    setNotice(""); setError(""); setEntryEditor({ type, id: entry?.id || null });
    setEntryForm(entry ? { ...blankEntry, ...entry, startDate: entry.startDate || "", endDate: entry.endDate || "", issueDate: entry.issueDate || "" } : { ...blankEntry, type });
  };
  const saveEntry = async (event) => {
    event.preventDefault(); setEntrySaving(true); setError("");
    try {
      const payload = { ...entryForm, type: entryEditor.type };
      const result = entryEditor.id
        ? await axios.put(`${API}/student/profile/entries/${entryEditor.id}`, payload, { headers: { ...auth, "Content-Type": "application/json" } })
        : await axios.post(`${API}/student/profile/entries`, payload, { headers: { ...auth, "Content-Type": "application/json" } });
      setEntries((current) => entryEditor.id ? current.map((entry) => entry.id === result.data.id ? result.data : entry) : [result.data, ...current]);
      setEntryEditor(null); setNotice("Profile section saved.");
    } catch (requestError) { setError(requestError.response?.data?.message || "This profile section could not be saved."); }
    finally { setEntrySaving(false); }
  };
  const deleteEntry = async (entry) => {
    if (!window.confirm(`Delete “${entry.title}” from your profile?`)) return;
    try { await axios.delete(`${API}/student/profile/entries/${entry.id}`, { headers: auth }); setEntries((current) => current.filter((item) => item.id !== entry.id)); setNotice("Profile entry deleted."); }
    catch (requestError) { setError(requestError.response?.data?.message || "This entry could not be deleted."); }
  };

  const analyzeResume = async (event) => {
    event.preventDefault(); if (!profile?.resume || !jobDescription.trim()) return;
    const form = new FormData(); form.append("resume", profile.resume); form.append("jobDescription", jobDescription.trim());
    setAnalyzing(true); setAnalysis(""); setError("");
    try { const result = await axios.post(`${API}/resume-analyzer/analyze`, form, { headers: auth }); const feedback = result.data.analysis; setAnalysis(typeof feedback === "string" ? feedback : JSON.stringify(feedback || { summary: "Analysis completed without a summary." }, null, 2)); }
    catch (requestError) { setError(apiErrorMessage(requestError, "Resume analysis failed. Check that the AI service is available and try again.")); }
    finally { setAnalyzing(false); }
  };

  const grouped = {
    PROJECT: entries.filter((entry) => entry.type === "PROJECT"),
    CERTIFICATION: entries.filter((entry) => entry.type === "CERTIFICATION"),
    EXPERIENCE: entries.filter((entry) => entry.type === "EXPERIENCE")
  };

  if (loading) return <><Headers /><main className="student-profile-page"><div className="profile-loading"><LoaderCircle className="spin"/>Loading your profile…</div></main></>;

  return <>
    <Headers />
    <main className="student-profile-page">
      <section className="profile-page-hero">
        <div className="profile-photo-control">
          {profile?.profilePhoto ? <img src={`${API}/student/photo/${encodeURIComponent(profile.profilePhoto)}`} alt={`${profile.name}'s profile`} /> : <span><UserRound size={30}/></span>}
          <label title="Update profile photo">{photoUploading ? "Uploading…" : "Change photo"}<input type="file" accept="image/*" onChange={uploadPhoto}/></label>
        </div>
        <div className="profile-hero-copy"><span className="profile-page-kicker">STUDENT PROFILE</span><h1>{profile?.name || "Your profile"}</h1><p>{profile?.email || "Your professional profile for placement opportunities."}</p></div>
        <div className="profile-completion-card"><span>Profile completion</span><strong>{completion}%</strong><div role="progressbar" aria-label="Profile completion" aria-valuenow={completion} aria-valuemin="0" aria-valuemax="100"><i style={{ width: `${completion}%` }}/></div></div>
      </section>
      {error && <div className="profile-feedback error" role="alert">{error}<button onClick={() => setError("")} aria-label="Dismiss error"><X size={16}/></button></div>}
      {notice && <div className="profile-feedback success" role="status"><Check size={16}/>{notice}<button onClick={() => setNotice("")} aria-label="Dismiss message"><X size={16}/></button></div>}
      <div className="profile-layout">
        <nav className="profile-section-nav" aria-label="Profile sections"><strong>On this page</strong>{[["personal","Personal"],["academic","Academic"],["skills","Skills"],["projects","Projects"],["certifications","Certifications"],["experience","Experience"],["links","Links"],["resume","Resume & visibility"]].map(([id,label]) => <a href={`#${id}`} key={id}>{label}</a>)}</nav>
        <div className="profile-sections">
          <form className="profile-section-card" id="personal" onSubmit={saveProfile}>
            <div className="profile-section-title"><span className="profile-section-icon"><UserRound size={18}/></span><div><h2>Personal information</h2><p>Your identity and contact details</p></div></div>
            <div className="profile-fields-grid">
              <label>Full name<input value={profile?.name || ""} disabled aria-describedby="name-note"/></label><small id="name-note" className="profile-field-note">Name is managed by your sign-in account.</small>
              <label>Email<input type="email" value={profile?.email || ""} disabled/></label>
              <label>Phone number<input name="phone" value={draft?.phone || ""} onChange={updateDraft} autoComplete="tel"/></label>
            </div>
            <div className="profile-section-title academic-title" id="academic"><span className="profile-section-icon"><GraduationCap size={18}/></span><div><h2>Academic information</h2><p>Details recruiters use to check eligibility</p></div></div>
            <div className="profile-fields-grid">
              <label>College<input name="collegeName" value={draft?.collegeName || ""} onChange={updateDraft}/></label>
              <label>Roll number<input name="rollNo" value={draft?.rollNo || ""} onChange={updateDraft}/></label>
              <label>Branch / department<input name="branch" value={draft?.branch || ""} onChange={updateDraft}/></label>
              <label>Degree<input name="degree" value={draft?.degree || ""} onChange={updateDraft}/></label>
              <label>Graduation year<input name="graduationYear" type="number" min="2000" max="2100" value={draft?.graduationYear || ""} onChange={updateDraft}/></label>
              <label>CGPA (out of 10)<input name="cgpa" type="number" min="0" max="10" step="0.01" value={draft?.cgpa ?? ""} onChange={updateDraft}/></label>
              <label>Active backlogs<input name="backlogs" type="number" min="0" value={draft?.backlogs ?? ""} onChange={updateDraft}/></label>
            </div>
            <button className="profile-save-button academic-save-button" type="button" disabled={saving} onClick={saveAcademicDetails}>{saving ? <LoaderCircle className="spin" size={16}/> : <Save size={16}/>}Save academic details</button>
            <div className="profile-section-title academic-title" id="skills"><span className="profile-section-icon"><Award size={18}/></span><div><h2>Skills</h2><p>Separate each skill with a comma</p></div></div>
            <label className="profile-full-field">Skills<input name="skills" value={draft?.skills || ""} onChange={updateDraft} placeholder="Java, SQL, React"/></label>
            <div className="profile-skill-chips">{(draft?.skills || "").split(/[,;]+/).map((skill) => skill.trim()).filter(Boolean).map((skill) => <span key={skill}>{skill}</span>)}</div>
            <button className="profile-save-button" type="submit" disabled={saving}>{saving ? <LoaderCircle className="spin" size={16}/> : <Save size={16}/>}Save profile details</button>
          </form>

          {[["PROJECT","projects","Projects","Project portfolio","Show what you have built",BriefcaseBusiness],["CERTIFICATION","certifications","Certifications","Certifications","Add credentials you have earned",Award],["EXPERIENCE","experience","Internships & experience","Experience","Highlight internships and relevant work",BriefcaseBusiness]].map(([type,id,title,subtitle,description,Icon]) => <section className="profile-section-card" id={id} key={type}>
            <div className="profile-section-title"><span className="profile-section-icon"><Icon size={18}/></span><div><h2>{title}</h2><p>{subtitle} · {description}</p></div><button className="profile-add-button" type="button" onClick={() => openEntryEditor(type)}><Plus size={16}/>Add</button></div>
            {grouped[type].length === 0 ? <div className="profile-section-empty"><span><Icon size={19}/></span><p>No {title.toLowerCase()} added yet.</p><button type="button" onClick={() => openEntryEditor(type)}>Add your first entry</button></div> : <div className="profile-entry-list">{grouped[type].map((entry) => <article className="profile-entry" key={entry.id}><div><span className="profile-entry-date">{entry.type === "CERTIFICATION" ? entry.issueDate || "Date not added" : [entry.startDate, entry.endDate || "Present"].filter(Boolean).join(" — ") || "Dates not added"}</span><h3>{entry.title}</h3>{entry.organization && <p className="profile-entry-org">{entry.organization}{entry.role ? ` · ${entry.role}` : ""}</p>}{entry.description && <p>{entry.description}</p>}{entry.technologies && <div className="profile-skill-chips">{entry.technologies.split(/[,;]+/).map((skill) => skill.trim()).filter(Boolean).map((skill) => <span key={skill}>{skill}</span>)}</div>}<div className="profile-entry-links">{[[entry.repositoryUrl,"Repository"],[entry.liveUrl,"Live demo"],[entry.credentialUrl,"Credential"]].filter(([url]) => url).map(([url,label]) => <a key={label} href={url} target="_blank" rel="noopener noreferrer">{label}<ExternalLink size={12}/></a>)}</div></div><div className="profile-entry-actions"><button type="button" title="Edit entry" aria-label={`Edit ${entry.title}`} onClick={() => openEntryEditor(type,entry)}><Pencil size={15}/></button><button type="button" title="Delete entry" aria-label={`Delete ${entry.title}`} onClick={() => deleteEntry(entry)}><Trash2 size={15}/></button></div></article>)}</div>}
          </section>)}

          <section className="profile-section-card" id="links">
            <div className="profile-section-title"><span className="profile-section-icon"><ExternalLink size={18}/></span><div><h2>Professional links</h2><p>Share your work with recruiters</p></div></div>
            <div className="profile-fields-grid">
              <label><span><Code2 size={14}/> GitHub</span><input type="url" name="githubProfile" value={draft?.githubProfile || ""} onChange={updateDraft} placeholder="https://github.com/username"/></label>
              <label><span><Link2 size={14}/> LinkedIn</span><input type="url" name="linkedInProfile" value={draft?.linkedInProfile || ""} onChange={updateDraft} placeholder="https://linkedin.com/in/username"/></label>
              <label>Portfolio website<input type="url" name="portfolioUrl" value={draft?.portfolioUrl || ""} onChange={updateDraft} placeholder="https://yourportfolio.dev"/></label>
            </div>
            <button className="profile-save-button" type="button" disabled={saving} onClick={saveProfile}>{saving ? <LoaderCircle className="spin" size={16}/> : <Save size={16}/>}Save profile links</button>
          </section>

          <section className="profile-section-card" id="resume">
            <div className="profile-section-title"><span className="profile-section-icon"><FileText size={18}/></span><div><h2>Resume & visibility</h2><p>Manage your resume and recruiter access</p></div></div>
            <div className="profile-resume-card"><span className="resume-file-icon"><FileText size={20}/></span><div><strong>{profile?.resume || "No resume uploaded"}</strong><small>{profile?.resume ? "PDF resume · upload date not available" : "Upload a PDF under 5 MB"}</small></div><div className="profile-resume-actions">{profile?.resume && <button type="button" onClick={viewResume}>View <ArrowUpRight size={14}/></button>}<label>{resumeUploading ? "Uploading…" : profile?.resume ? "Replace" : "Upload PDF"}<input type="file" accept="application/pdf,.pdf" onChange={uploadResume}/></label></div></div>
            {profile?.resume && <div className="profile-analyzer-inline"><div><strong>Resume analysis</strong><p>Analysis is generated on request and is not saved as a score.</p></div><button type="button" onClick={() => { setAnalysis(""); setAnalyzerOpen(true); }}>Analyze resume <ArrowUpRight size={14}/></button></div>}
            <label className="visibility-setting"><input type="checkbox" checked={draft?.profileVisible !== false} onChange={updateDraft} name="profileVisible"/><span><strong>Visible to recruiters</strong><small>Your profile details can be shown to recruiters reviewing applicants. Turn this off to hide your details from recruiter applicant views.</small></span></label>
            <button className="profile-save-button" type="button" disabled={saving} onClick={saveProfile}>{saving ? <LoaderCircle className="spin" size={16}/> : <Save size={16}/>}Save visibility</button>
          </section>
        </div>
      </div>

      {entryEditor && <div className="profile-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setEntryEditor(null); }}><form className="profile-entry-modal" onSubmit={saveEntry}>
        <div className="profile-modal-header"><div><span>PROFILE PORTFOLIO</span><h2>{entryEditor.id ? "Edit" : "Add"} {entryEditor.type === "PROJECT" ? "project" : entryEditor.type === "CERTIFICATION" ? "certification" : "experience"}</h2></div><button type="button" onClick={() => setEntryEditor(null)} aria-label="Close"><X size={18}/></button></div>
        <div className="profile-entry-form-grid">
          <label>{entryEditor.type === "PROJECT" ? "Project title" : entryEditor.type === "CERTIFICATION" ? "Certification name" : "Organization"}<input required maxLength="180" value={entryForm.title} onChange={(event) => setEntryForm({ ...entryForm, title: event.target.value })}/></label>
          {entryEditor.type !== "PROJECT" && <label>{entryEditor.type === "CERTIFICATION" ? "Issuing organization" : "Company"}<input required maxLength="180" value={entryForm.organization} onChange={(event) => setEntryForm({ ...entryForm, organization: event.target.value })}/></label>}
          {entryEditor.type === "EXPERIENCE" && <label>Role<input required maxLength="180" value={entryForm.role} onChange={(event) => setEntryForm({ ...entryForm, role: event.target.value })}/></label>}
          <label className="entry-form-wide">Description<textarea maxLength="3000" rows="4" value={entryForm.description} onChange={(event) => setEntryForm({ ...entryForm, description: event.target.value })}/></label>
          {entryEditor.type !== "CERTIFICATION" && <label className="entry-form-wide">Technologies / skills<input maxLength="1000" value={entryForm.technologies} onChange={(event) => setEntryForm({ ...entryForm, technologies: event.target.value })} placeholder="Java, Spring Boot, MySQL"/></label>}
          {entryEditor.type === "PROJECT" && <><label>Repository URL<input type="url" value={entryForm.repositoryUrl} onChange={(event) => setEntryForm({ ...entryForm, repositoryUrl: event.target.value })}/></label><label>Live demo URL<input type="url" value={entryForm.liveUrl} onChange={(event) => setEntryForm({ ...entryForm, liveUrl: event.target.value })}/></label></>}
          {entryEditor.type === "CERTIFICATION" && <><label>Issue date<input type="date" value={entryForm.issueDate} onChange={(event) => setEntryForm({ ...entryForm, issueDate: event.target.value })}/></label><label>Credential URL<input type="url" value={entryForm.credentialUrl} onChange={(event) => setEntryForm({ ...entryForm, credentialUrl: event.target.value })}/></label></>}
          {entryEditor.type === "EXPERIENCE" && <><label>Start date<input type="date" value={entryForm.startDate} onChange={(event) => setEntryForm({ ...entryForm, startDate: event.target.value })}/></label><label>End date<input type="date" value={entryForm.endDate} onChange={(event) => setEntryForm({ ...entryForm, endDate: event.target.value })}/></label></>}
        </div>
        {error && <p className="profile-feedback error" role="alert">{error}</p>}
        <div className="profile-modal-actions"><button type="button" onClick={() => setEntryEditor(null)}>Cancel</button><button type="submit" disabled={entrySaving}>{entrySaving ? "Saving…" : "Save entry"}</button></div>
      </form></div>}

      {analyzerOpen && <div className="profile-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setAnalyzerOpen(false); }}><form className="profile-entry-modal analyzer-modal" onSubmit={analyzeResume}><div className="profile-modal-header"><div><span>AI RESUME ANALYZER</span><h2>Compare resume to a role</h2></div><button type="button" onClick={() => setAnalyzerOpen(false)} aria-label="Close"><X size={18}/></button></div><p className="analyzer-disclaimer">The analysis uses your uploaded PDF and the job description. Results are not stored as a resume score.</p><label>Job description<textarea required rows="7" value={jobDescription} onChange={(event) => setJobDescription(event.target.value)} placeholder="Paste the job description here"/></label>{error && <div className="profile-feedback error" role="alert">{error}</div>}{analysis && <pre className="profile-analysis-output">{analysis}</pre>}<div className="profile-modal-actions"><button type="button" onClick={() => setAnalyzerOpen(false)}>Close</button><button type="submit" disabled={analyzing || !jobDescription.trim()}>{analyzing ? "Analyzing…" : "Analyze resume"}</button></div></form></div>}
    </main>
  </>;
}

export default StudentProfile;
