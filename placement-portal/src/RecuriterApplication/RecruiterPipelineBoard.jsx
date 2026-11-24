import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Clock3, Filter, Search, X } from "lucide-react";
import { toast } from "react-toastify";
import { scheduleInterviewInvite } from "./interviewScheduling.js";
import "./RecruiterPipelineBoard.css";

const API = "http://localhost:8080/api";
const STAGES = ["APPLIED", "UNDER_REVIEW", "SHORTLISTED", "INTERVIEW_SCHEDULED", "INTERVIEWED", "SELECTED", "REJECTED"];
const stageLabel = (stage) => stage === "INTERVIEWED" ? "INTERVIEW COMPLETED" : stage.replaceAll("_", " ");
const auth = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
const canMoveTo = (current, target) => {
  if (current === target || target === "REJECTED") return true;
  if (current === "SELECTED" || current === "REJECTED") return !["SELECTED", "REJECTED"].includes(target);
  if (target === "SELECTED") return current === "INTERVIEWED";
  return STAGES.indexOf(target) < STAGES.indexOf(current) || STAGES.indexOf(target) === STAGES.indexOf(current) + 1;
};

export default function RecruiterPipelineBoard() {
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [matches, setMatches] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [jobId, setJobId] = useState("ALL");
  const [stageFilter, setStageFilter] = useState("ALL");
  const [eligibility, setEligibility] = useState("ALL");
  const [sort, setSort] = useState("DATE_DESC");
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState([]);
  const [matchDetail, setMatchDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);

  const loadPipeline = async () => {
    setError(""); setLoading(true); setMatches({});
    try {
      const [pipelineResult, matchesResult] = await Promise.allSettled([
        axios.get(`${API}/recruiter/pipeline/applicants`, auth()),
        axios.get(`${API}/recruiter/pipeline/matches`, auth())
      ]);
      if (pipelineResult.status !== "fulfilled") throw pipelineResult.reason;
      const rows = Array.isArray(pipelineResult.value.data) ? pipelineResult.value.data : [];
      if (matchesResult.status === "fulfilled") setMatches(Object.fromEntries((matchesResult.value.data || []).map((match) => [match.applicationId, match])));
      setCandidates(rows);
      setJobs([...new Map(rows.map((row) => [row.jobId, { id: row.jobId, title: row.jobTitle, company: row.company }])).values()]);
    } catch (e) {
      console.error(e); setError(e.response?.data?.message || "Pipeline applicants could not be loaded.");
    } finally { setLoading(false); }
  };

  useEffect(() => { loadPipeline(); }, []);

  const filtered = useMemo(() => candidates.filter((candidate) => {
    const match = matches[candidate.applicationId];
    const needle = search.trim().toLowerCase();
    return (jobId === "ALL" || String(candidate.jobId) === jobId)
      && (stageFilter === "ALL" || candidate.stage === stageFilter)
      && (eligibility === "ALL" || match?.eligibilityStatus === eligibility)
      && (!needle || [candidate.studentName, candidate.jobTitle, candidate.company].some((value) => String(value || "").toLowerCase().includes(needle)));
  }), [candidates, jobId, stageFilter, eligibility, search, matches]);

  const sortCandidates = (items) => [...items].sort((a, b) => {
    if (sort === "MATCH_DESC") return (matches[b.applicationId]?.matchScore ?? -1) - (matches[a.applicationId]?.matchScore ?? -1);
    const av = a.appliedAt ? new Date(a.appliedAt).getTime() : 0;
    const bv = b.appliedAt ? new Date(b.appliedAt).getTime() : 0;
    return sort === "DATE_ASC" ? av - bv : bv - av;
  });

  const move = async (candidate, nextStage, note = "") => {
    if (nextStage === candidate.stage) return true;
    const wasTerminal = candidate.stage === "SELECTED" || candidate.stage === "REJECTED";
    const reopen = wasTerminal && window.confirm(`${candidate.studentName} is ${candidate.stage.toLowerCase()}. Reopen this application and move it to ${nextStage.replaceAll("_", " ")}?`);
    if (wasTerminal && !reopen) return false;
    setSavingId(candidate.applicationId);
    try {
      if (nextStage === "INTERVIEW_SCHEDULED") {
        const sent = await scheduleInterviewInvite(candidate.applicationId, candidate.studentName);
        if (!sent) return false;
      } else {
        await axios.put(`${API}/recruiter/pipeline/applications/${candidate.applicationId}/stage`, { stage: nextStage, reopen, note }, auth());
      }
      setCandidates((prev) => prev.map((item) => item.applicationId === candidate.applicationId ? { ...item, stage: nextStage } : item));
      toast.success(nextStage === "INTERVIEW_SCHEDULED"
        ? `Interview invitation emailed to ${candidate.studentName}.`
        : `Moved ${candidate.studentName} to ${nextStage.replaceAll("_", " ")}.`);
      if (selected?.applicationId === candidate.applicationId) openDetails({ ...candidate, stage: nextStage });
      return true;
    } catch (e) {
      toast.error(e.response?.data?.message || "Could not update candidate stage.");
      return false;
    } finally { setSavingId(null); }
  };

  const openDetails = async (candidate) => {
    if (candidate.stage === "APPLIED") {
      const changed = await move(candidate, "UNDER_REVIEW", "Moved to under review when recruiter opened candidate details.");
      if (changed) candidate = { ...candidate, stage: "UNDER_REVIEW" };
    }
    setSelected(candidate); setHistory([]); setMatchDetail(null); setDetailLoading(true);
    const requests = [axios.get(`${API}/recruiter/pipeline/applications/${candidate.applicationId}/history`, auth())];
    if (jobId !== "ALL" || candidate.jobId) requests.push(axios.get(`${API}/recruiter/jobs/${candidate.jobId}/candidate-matches/${candidate.applicationId}`, auth()));
    const [historyResult, matchResult] = await Promise.allSettled(requests);
    if (historyResult.status === "fulfilled") setHistory(historyResult.value.data || []);
    if (matchResult?.status === "fulfilled") setMatchDetail(matchResult.value.data);
    setDetailLoading(false);
  };

  const viewResume = async (candidate) => {
    if (!candidate.resume) { toast.info("No resume uploaded."); return; }
    try {
      const { data } = await axios.get(`${API}/recruiter/pipeline/applications/${candidate.applicationId}/resume`, { ...auth(), responseType: "blob" });
      const url = URL.createObjectURL(data); window.open(url, "_blank", "noopener,noreferrer");
      window.setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (e) { console.error(e); toast.error("Unable to open this resume."); }
  };

  return <section className="pipeline-workspace" aria-label="Applicant pipeline">
    <header className="pipeline-heading"><div><span className="pipeline-eyebrow">RECRUITMENT WORKFLOW</span><h2>Applicant pipeline</h2><p>Move candidates through each hiring stage and keep a clear change history.</p></div><span className="pipeline-total">{filtered.length} candidates</span></header>
    <div className="pipeline-toolbar">
      <label className="pipeline-search"><Search size={17}/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search candidate or job" aria-label="Search pipeline"/></label>
      <label>Job<select value={jobId} onChange={(e) => setJobId(e.target.value)}><option value="ALL">All jobs</option>{jobs.map((job) => <option key={job.id} value={job.id}>{job.title}</option>)}</select></label>
      <label>Stage<select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)}><option value="ALL">All stages</option>{STAGES.map((stage) => <option key={stage} value={stage}>{stageLabel(stage)}</option>)}</select></label>
      <label>Eligibility<select value={eligibility} onChange={(e) => setEligibility(e.target.value)}><option value="ALL">All eligibility</option><option value="ELIGIBLE">Eligible</option><option value="NOT_ELIGIBLE">Not eligible</option><option value="NEEDS_REVIEW">Needs review</option></select></label>
      <label>Sort by<select value={sort} onChange={(e) => setSort(e.target.value)}><option value="DATE_DESC">Newest application</option><option value="DATE_ASC">Oldest application</option><option value="MATCH_DESC">Highest match</option></select></label>
    </div>
    {Object.keys(matches).length === 0 && candidates.length > 0 && <p className="pipeline-hint"><Filter size={14}/> Step 1 match details are unavailable for these candidates.</p>}
    {loading ? <div className="pipeline-empty">Loading applicant pipeline…</div> : error ? <div className="pipeline-empty pipeline-error">{error}<button onClick={loadPipeline}>Retry</button></div> : filtered.length === 0 ? <div className="pipeline-empty">No applicants match these filters.</div> :
      <div className="pipeline-board" aria-label="Recruitment stages">
        {STAGES.map((stage) => {
          const stageCandidates = sortCandidates(filtered.filter((candidate) => candidate.stage === stage));
          return <section className={`pipeline-column pipeline-column-${stage.toLowerCase()}`} key={stage} aria-label={`${stageLabel(stage)} candidates`}>
            <header><div><h3>{stageLabel(stage)}</h3><span>{stageCandidates.length} candidate{stageCandidates.length === 1 ? "" : "s"}</span></div><i/></header>
            <div className="pipeline-cards">{stageCandidates.map((candidate) => {
              const match = matches[candidate.applicationId];
              return <article key={candidate.applicationId} className="pipeline-candidate-card">
                <button className="pipeline-card-main" onClick={() => openDetails(candidate)}><strong>{candidate.studentName || "Student"}</strong><span>{candidate.jobTitle}{candidate.company ? ` · ${candidate.company}` : ""}</span><small>{candidate.appliedAt ? new Date(candidate.appliedAt).toLocaleDateString() : "Application date unavailable"}</small></button>
                {match && <div className="pipeline-match"><b>{match.matchScoreAvailable ? `${match.matchScore}% match` : "Score unavailable"}</b><span className={`pipeline-eligibility ${match.eligibilityStatus?.toLowerCase()}`}>{match.eligibilityStatus?.replaceAll("_", " ")}</span>{match.matchedSkills?.length > 0 && <small>Skills: {match.matchedSkills.join(", ")}</small>}</div>}
                <div className="pipeline-card-actions">
                  {stage === "SHORTLISTED" && <button disabled={savingId === candidate.applicationId} onClick={() => move(candidate, "INTERVIEW_SCHEDULED")}>Schedule interview</button>}
                  {stage === "INTERVIEW_SCHEDULED" && <button disabled={savingId === candidate.applicationId} onClick={() => move(candidate, "INTERVIEWED")}>Mark interview complete</button>}
                  {stage === "INTERVIEWED" && <button className="pipeline-select-action" disabled={savingId === candidate.applicationId} onClick={() => move(candidate, "SELECTED")}>Select candidate</button>}
                  {!['REJECTED', 'SELECTED'].includes(stage) && <button className="pipeline-reject-action" disabled={savingId === candidate.applicationId} onClick={() => window.confirm(`Reject ${candidate.studentName || "this candidate"}?`) && move(candidate, "REJECTED")}>Reject</button>}
                </div>
                <label className="pipeline-move">Move to<select aria-label={`Move ${candidate.studentName} from ${stageLabel(stage)}`} value={stage} disabled={savingId === candidate.applicationId} onChange={(e) => move(candidate, e.target.value)}>{STAGES.map((next) => <option key={next} value={next} disabled={!canMoveTo(stage, next)}>{stageLabel(next)}</option>)}</select></label>
              </article>;
            })}{stageCandidates.length === 0 && <p className="pipeline-column-empty">No candidates in this stage.</p>}</div>
          </section>;
        })}
      </div>}
    {selected && <div className="pipeline-drawer-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setSelected(null)}><aside className="pipeline-drawer" aria-label="Candidate details">
      <button className="pipeline-drawer-close" onClick={() => setSelected(null)} aria-label="Close details"><X size={19}/></button>
      <span className="pipeline-eyebrow">APPLICATION #{selected.applicationId}</span><h2>{selected.studentName || "Student"}</h2><p className="pipeline-detail-subtitle">{selected.jobTitle} · {selected.company}</p>
      <div className="pipeline-detail-grid"><p><b>Current stage</b><span>{stageLabel(selected.stage)}</span></p><p><b>Applied</b><span>{selected.appliedAt ? new Date(selected.appliedAt).toLocaleString() : "Date unavailable"}</span></p><p><b>Branch</b><span>{selected.branch || "Not provided"}</span></p><p><b>CGPA</b><span>{selected.cgpa ?? "Not provided"}</span></p><p><b>Email</b><span>{selected.studentEmail || "Not provided"}</span></p><p><b>Phone</b><span>{selected.phone || "Not provided"}</span></p><p className="pipeline-detail-wide"><b>Skills</b><span>{selected.skills || "Not provided"}</span></p></div>
      <button className="pipeline-resume-button" onClick={() => viewResume(selected)}>View resume</button>
      <div className="pipeline-detail-actions">
        {selected.stage === "SHORTLISTED" && <button disabled={savingId === selected.applicationId} onClick={() => move(selected, "INTERVIEW_SCHEDULED")}>Schedule interview</button>}
        {selected.stage === "INTERVIEW_SCHEDULED" && <button disabled={savingId === selected.applicationId} onClick={() => move(selected, "INTERVIEWED")}>Mark interview complete</button>}
        {selected.stage === "INTERVIEWED" && <button className="pipeline-select-action" disabled={savingId === selected.applicationId} onClick={() => move(selected, "SELECTED")}>Select candidate</button>}
        {!['REJECTED', 'SELECTED'].includes(selected.stage) && <button className="pipeline-reject-action" disabled={savingId === selected.applicationId} onClick={() => window.confirm(`Reject ${selected.studentName || "this candidate"}?`) && move(selected, "REJECTED")}>Reject application</button>}
      </div>
      {detailLoading ? <p>Loading details…</p> : <>
        {matchDetail && <section className="pipeline-detail-section"><h3>Step 1 match analysis</h3><p><b>{matchDetail.matchScoreAvailable ? `${matchDetail.matchScore}%` : "Score unavailable"}</b> · {matchDetail.eligibilityStatus.replaceAll("_", " ")}</p><p>Matched: {matchDetail.matchedSkills?.join(", ") || "None recorded"}</p><p>Missing: {matchDetail.missingSkills?.join(", ") || "None"}</p><p>Branch: {matchDetail.branchMatchStatus} · CGPA: {matchDetail.cgpaMatchStatus}</p></section>}
        <section className="pipeline-detail-section"><h3>Stage history</h3>{history.length === 0 ? <p className="pipeline-history-empty"><Clock3 size={15}/> Historical tracking began with this feature. No stage changes have been recorded yet.</p> : <ol className="pipeline-history">{history.map((event) => <li key={event.id}><b>{event.previousStage?.replaceAll("_", " ") || "Created"} → {event.newStage.replaceAll("_", " ")}</b><time>{new Date(event.changedAt).toLocaleString()}</time>{event.note && <p>{event.note}</p>}</li>)}</ol>}</section>
      </>}
    </aside></div>}
  </section>;
}
