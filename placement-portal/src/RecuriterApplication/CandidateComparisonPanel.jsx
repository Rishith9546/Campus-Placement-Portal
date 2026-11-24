import { Fragment, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { ArrowLeft, FileText, X } from "lucide-react";
import { toast } from "react-toastify";
import { scheduleInterviewInvite } from "./interviewScheduling.js";
import "./CandidateComparisonPanel.css";

const API = "http://localhost:8080/api";
const auth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
const listSkills = (raw) => [...new Map(String(raw || "").split(/[,;|\n]+/).map((skill) => skill.trim()).filter(Boolean).map((skill) => [skill.toLowerCase().replace(/\s+/g, " "), skill])).values()];

export default function CandidateComparisonPanel({ jobId, applicationIds, applications, onClose, onRemove, onViewProfile, onShortlist, onReject, onStageUpdate }) {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    let active = true;
    if (!jobId || applicationIds.length < 2 || applicationIds.length > 5) { setError("Select 2 to 5 applicants for the same job."); setLoading(false); return () => { active = false; }; }
    setLoading(true); setError("");
    axios.post(`${API}/recruiter/jobs/${jobId}/comparison`, { applicationIds }, auth())
      .then(({ data }) => { if (active) setCandidates(Array.isArray(data) ? data : []); })
      .catch((e) => { console.error(e); if (active) setError(e.response?.data?.message || "Candidate comparison could not be loaded."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [jobId, applicationIds.join(",")]);

  const skillGroups = useMemo(() => candidates.map((candidate) => listSkills(candidate.skills)), [candidates]);
  const commonSkills = useMemo(() => {
    if (!skillGroups.length) return [];
    return skillGroups[0].filter((skill) => skillGroups.every((group) => group.some((item) => item.toLowerCase() === skill.toLowerCase())));
  }, [skillGroups]);
  const uniqueSkills = useMemo(() => skillGroups.map((group, index) => group.filter((skill) => skillGroups.every((other, otherIndex) => index === otherIndex || !other.some((item) => item.toLowerCase() === skill.toLowerCase())))), [skillGroups]);
  const highestMatchId = candidates.filter((c) => c.match?.scoreAvailable).reduce((best, current) => !best || current.match.score > best.match.score ? current : best, null)?.applicationId;
  const cgpaCandidates = candidates.filter((c) => Number.isFinite(c.cgpa));
  const highestCgpaId = cgpaCandidates.reduce((best, current) => !best || current.cgpa > best.cgpa ? current : best, null)?.applicationId;
  const jobTitle = applications.find((a) => String(a.job?.id) === String(jobId))?.job?.title || "Selected job";

  const viewResume = async (candidate) => {
    if (!candidate.resumeAvailable) { toast.info("No resume is available for this application."); return; }
    const tab = window.open("about:blank", "_blank");
    if (tab) tab.opener = null;
    try {
      const { data } = await axios.get(`${API}/recruiter/pipeline/applications/${candidate.applicationId}/resume`, { ...auth(), responseType: "blob" });
      const url = URL.createObjectURL(data);
      if (tab) tab.location.replace(url); else toast.info("Allow pop-ups to open the resume in a new tab.");
      window.setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (e) { if (tab) tab.close(); console.error(e); toast.error("Unable to view this resume."); }
  };

  const changeStage = async (candidate, stage) => {
    setBusyId(candidate.applicationId);
    try {
      if (stage === "INTERVIEW_SCHEDULED") {
        const sent = await scheduleInterviewInvite(candidate.applicationId, candidate.studentName);
        if (!sent) return;
      } else {
        await axios.put(`${API}/recruiter/pipeline/applications/${candidate.applicationId}/stage`, { stage, reopen: false, note: null }, auth());
      }
      setCandidates((prev) => prev.map((item) => item.applicationId === candidate.applicationId ? { ...item, currentStage: stage } : item));
      onStageUpdate(candidate.applicationId, stage);
      toast.success(stage === "INTERVIEW_SCHEDULED" ? `Interview invitation emailed to ${candidate.studentName}.` : `${candidate.studentName} moved to ${stage.replaceAll("_", " ").toLowerCase()}.`);
    } catch (e) { toast.error(e.response?.data?.message || e.message || "Could not update this candidate's interview stage."); }
    finally { setBusyId(null); }
  };

  const act = async (candidate, action) => {
    const application = applications.find((a) => a.id === candidate.applicationId);
    if (!application) { toast.error("This application is no longer available."); return; }
    setBusyId(candidate.applicationId);
    try {
      const success = await action(application);
      if (success !== false) setCandidates((prev) => prev.map((item) => item.applicationId === candidate.applicationId ? { ...item, currentStage: action === onShortlist ? "SHORTLISTED" : "REJECTED" } : item));
    } finally { setBusyId(null); }
  };

  const renderList = (items, empty = "Not provided") => items?.length ? items.join(", ") : empty;
  const row = (label, value, className = "") => <tr key={label}><th scope="row">{label}</th>{candidates.map((candidate, index) => <td className={typeof className === "function" ? className(candidate) : className} key={candidate.applicationId}>{typeof value === "function" ? value(candidate, index) : value}</td>)}</tr>;

  return <div className="comparison-overlay" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
    <section className="comparison-panel" role="dialog" aria-modal="true" aria-labelledby="comparison-title">
      <header className="comparison-header"><button className="comparison-back" onClick={onClose}><ArrowLeft size={17}/> Back to applicants</button><button className="comparison-close" onClick={onClose} aria-label="Close comparison"><X size={19}/></button><span className="comparison-kicker">RECRUITER EVALUATION</span><h1 id="comparison-title">Candidate comparison</h1><p>{jobTitle} · {applicationIds.length} candidates</p><div className="comparison-selected-tags">{candidates.map((candidate) => <span key={candidate.applicationId}>{candidate.studentName}<button onClick={() => onRemove(candidate.applicationId)} aria-label={`Remove ${candidate.studentName}`}><X size={13}/></button></span>)}</div></header>
      {loading ? <div className="comparison-state">Loading applicant comparison…</div> : error ? <div className="comparison-state comparison-error">{error}<button onClick={onClose}>Return to applicants</button></div> : candidates.length < 2 ? <div className="comparison-state">Choose at least two applicants to compare.</div> : <>
        <div className="comparison-highlights"><article><span>Highest match</span><strong>{candidates.find((c) => c.applicationId === highestMatchId)?.studentName || "Unavailable"}</strong><small>{candidates.find((c) => c.applicationId === highestMatchId)?.match?.scoreAvailable ? `${candidates.find((c) => c.applicationId === highestMatchId).match.score}%` : "No score available"}</small></article><article><span>Highest CGPA</span><strong>{candidates.find((c) => c.applicationId === highestCgpaId)?.studentName || "Unavailable"}</strong><small>{highestCgpaId ? `${candidates.find((c) => c.applicationId === highestCgpaId).cgpa} · one academic signal only` : "No CGPA recorded"}</small></article><article><span>Shared skills</span><strong>{commonSkills.length ? commonSkills.join(", ") : "None recorded across all candidates"}</strong><small>Based on saved profile skills</small></article></div>
        <div className="comparison-table-wrap"><table className="comparison-table"><thead><tr><th scope="col">Comparison</th>{candidates.map((candidate, index) => <th scope="col" key={candidate.applicationId}><div className={`comparison-person ${candidate.applicationId === highestMatchId ? "top-match" : ""}`}><small>Candidate {index + 1}{candidate.applicationId === highestMatchId ? " · Highest match" : ""}</small><strong>{candidate.studentName}</strong><span>Application #{candidate.applicationId}</span><div className="comparison-actions"><button onClick={() => { const app = applications.find((item) => item.id === candidate.applicationId); if (app) onViewProfile(app); }} disabled={!candidate.profileAvailable}>View profile</button><button onClick={() => viewResume(candidate)} disabled={!candidate.resumeAvailable}><FileText size={14}/> Resume</button></div></div></th>)}</tr></thead>
          <tbody>
            {row("Branch", (c) => c.branch || "Not provided")}
            {row("CGPA", (c) => c.cgpa ?? "Not provided", (c) => c.applicationId === highestCgpaId ? "comparison-best" : "")}
            {row("Application date", (c) => c.appliedAt ? new Date(c.appliedAt).toLocaleDateString() : "Date unavailable")}
            {row("Recruitment stage", (c) => c.currentStage?.replaceAll("_", " ") || "APPLIED")}
            {row("Match score", (c) => <span className={`comparison-score ${c.applicationId === highestMatchId ? "comparison-best" : ""}`}>{c.match?.scoreAvailable ? `${c.match.score}/100` : "Unavailable"}</span>)}
            {row("Eligibility", (c) => <span className={`comparison-eligibility ${c.match?.eligibilityStatus?.toLowerCase()}`}>{c.match?.eligibilityStatus?.replaceAll("_", " ") || "Needs review"}</span>)}
            {row("Score breakdown", (c) => c.match ? `Skills ${c.match.skillsScore ?? "N/A"}% · Branch ${c.match.branchScore ?? "N/A"}% · CGPA ${c.match.cgpaScore ?? "N/A"}%` : "Unavailable")}
            {row("Score method", (c) => c.match?.explanation || "Match explanation unavailable")}
            {row("Posted eligibility requirements", (c) => c.match?.jobEligibilityCriteria || "No eligibility criteria provided")}
            {row("Minimum CGPA requirement", (c) => c.match?.minimumCgpa ?? "Not specified")}
            {row("Eligible branches", (c) => renderList(c.match?.eligibleBranches, "Not specified or unrestricted"))}
            {row("Branch requirement", (c) => c.match?.branchStatus?.replaceAll("_", " ") || "Not assessed")}
            {row("CGPA requirement", (c) => c.match?.cgpaStatus?.replaceAll("_", " ") || "Not assessed")}
            {row("Required skills", (c) => renderList(c.match?.requiredSkills, "No job skills specified"))}
            {row("Skills in profile", (_, index) => renderList(skillGroups[index]))}
            {row("Shared skills", () => renderList(commonSkills, "None"))}
            {candidates.map((candidate, index) => <Fragment key={`unique-${candidate.applicationId}`}>{index === 0 && <tr className="comparison-section-row"><th colSpan={candidates.length + 1}>Candidate-specific skills</th></tr>}<tr><th scope="row">Unique to {candidate.studentName}</th>{candidates.map((entry, col) => <td key={entry.applicationId}>{col === index ? renderList(uniqueSkills[index], "None identified") : "—"}</td>)}</tr></Fragment>)}
            {row("Missing required skills", (c) => renderList(c.match?.missingSkills, "None"))}
            <tr className="comparison-section-row"><th colSpan={candidates.length + 1}>Projects · actual profile entries</th></tr>
            {row("Projects", (c) => c.projects?.length ? <ul className="comparison-entry-list">{c.projects.map((entry, i) => <li key={`${entry.title}-${i}`}><strong>{entry.title}</strong>{entry.technologies && <span>{entry.technologies}</span>}{entry.description && <p>{entry.description}</p>}</li>)}</ul> : "No project entries recorded")}
            {row("Experience / internships", (c) => c.experience?.length ? <ul className="comparison-entry-list">{c.experience.map((entry, i) => <li key={`${entry.title}-${i}`}><strong>{entry.role ? `${entry.role} · ` : ""}{entry.title}</strong>{entry.organization && <span>{entry.organization}</span>}{entry.description && <p>{entry.description}</p>}</li>)}</ul> : "No experience entries recorded")}
            {row("Resume", (c) => c.resumeAvailable ? <button className="comparison-inline-resume" onClick={() => viewResume(c)}>View secure resume</button> : "No resume available")}
          </tbody></table></div>
        <p className="comparison-note">Match scores use the backend’s deterministic job criteria. CGPA is one comparison point; review the full profile and interview evidence. No candidate is automatically rejected.</p>
        <footer className="comparison-footer">{candidates.map((candidate) => <div key={candidate.applicationId} className="comparison-footer-candidate"><strong>{candidate.studentName}</strong><div><button disabled={busyId === candidate.applicationId || candidate.currentStage === "SHORTLISTED" || candidate.currentStage === "SELECTED" || candidate.currentStage === "REJECTED"} onClick={() => act(candidate, onShortlist)}>Shortlist</button><button disabled={busyId === candidate.applicationId || candidate.currentStage !== "SHORTLISTED"} onClick={() => changeStage(candidate, "INTERVIEW_SCHEDULED")}>Schedule interview</button><button disabled={busyId === candidate.applicationId || candidate.currentStage !== "INTERVIEW_SCHEDULED"} onClick={() => changeStage(candidate, "INTERVIEWED")}>Mark interviewed</button><button disabled={busyId === candidate.applicationId || candidate.currentStage !== "INTERVIEWED"} onClick={() => changeStage(candidate, "SELECTED")}>Select candidate</button><button className="comparison-reject" disabled={busyId === candidate.applicationId || candidate.currentStage === "REJECTED" || candidate.currentStage === "SELECTED"} onClick={() => { if (window.confirm(`Reject ${candidate.studentName} for ${jobTitle}?`)) act(candidate, onReject); }}>Reject</button></div></div>)}</footer>
      </>}
    </section>
  </div>;
}
