import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { ArrowDownRight, ArrowUpRight, Check, ChevronDown, Clipboard, FileSearch, History, Info, LoaderCircle, RefreshCw, Sparkles, Target, WandSparkles } from "lucide-react";
import "./ResumeAnalyzer.css";

const API = "http://localhost:8080/api/resume-analyzer";
const CATEGORY_LABELS = { skillsRelevance: "Skills relevance and quality", projectsQuality: "Projects quality and impact", education: "Education", experience: "Experience and internships", achievements: "Achievements", structureCompleteness: "Structure and completeness", atsReadability: "ATS readability and formatting", measurableImpact: "Measurable impact" };
const SECTION_LABELS = { contactInformation: "Contact information", professionalSummary: "Professional summary", education: "Education", technicalSkills: "Technical skills", projects: "Projects", experience: "Internship / experience", certifications: "Certifications", achievements: "Achievements", github: "GitHub", linkedin: "LinkedIn", portfolio: "Portfolio" };
const requestId = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const list = (x) => Array.isArray(x) ? x : [];
const requestErrorMessage = (error, fallback) => {
  const body = error?.response?.data;
  if (typeof body === "string" && body.trim()) return body.trim();
  const detail = body?.detail || body?.message || body?.title;
  if (detail) return detail;
  if (body?.error || body?.status) return [body.status, body.error, body.path].filter(Boolean).join(" · ");
  if (!error?.response) return error?.code === "ECONNABORTED"
    ? "Resume analysis timed out. The AI service may be taking too long; check the backend log and retry."
    : "Could not reach the server. Check that the backend is running and retry.";
  return fallback;
};

export default function ResumeAnalyzer() {
  const [token] = useState(() => localStorage.getItem("token"));
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [jobId, setJobId] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [latest, setLatest] = useState(null);
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState([]);
  const [trend, setTrend] = useState([]);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [compareIds, setCompareIds] = useState(["", ""]);
  const [comparison, setComparison] = useState(null);
  const [section, setSection] = useState("professionalSummary");
  const [originalText, setOriginalText] = useState("");
  const [instructions, setInstructions] = useState("");
  const [improvement, setImprovement] = useState(null);
  const [improving, setImproving] = useState(false);

  const auth = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);
  const load = useCallback(async () => {
    if (!token) { setError("Sign in as a student to use Resume Intelligence."); setLoading(false); return; }
    setLoading(true); setError("");
    const requests = await Promise.allSettled([
      axios.get(`${API}/latest`, { headers: auth }), axios.get(`${API}/history?limit=50`, { headers: auth }), axios.get(`${API}/trend`, { headers: auth }),
      axios.get("http://localhost:8080/api/student/profile", { headers: auth }), axios.get("http://localhost:8080/api/jobs/allJobs", { headers: auth }),
    ]);
    const [latestRes, historyRes, trendRes, profileRes, jobsRes] = requests;
    if (latestRes.status === "fulfilled") setLatest(latestRes.value.status === 204 ? null : latestRes.value.data);
    else if (latestRes.reason?.response?.status !== 404) setError(latestRes.reason?.response?.data?.message || "Could not load your latest resume analysis.");
    if (historyRes.status === "fulfilled") { setHistory(historyRes.value.data || []); if (!latestRes.value || latestRes.value.status === 204) setLatest((historyRes.value.data || []).find((a) => a.status === "COMPLETED") || null); }
    if (trendRes.status === "fulfilled") setTrend(trendRes.value.data || []);
    if (profileRes.status === "fulfilled") setProfile(profileRes.value.data);
    if (jobsRes.status === "fulfilled") { const data = jobsRes.value.data; setJobs(Array.isArray(data) ? data : data?.content || data?.jobs || []); }
    setLoading(false);
  }, [token, auth]);
  useEffect(() => { load(); }, [load]);

  const runAnalysis = async () => {
    if (!profile?.resume) { setError("Upload a PDF resume from your profile before starting an analysis."); return; }
    setBusy(true); setError(""); setNotice(""); setSelected(null);
    try {
      const body = new FormData(); body.append("resume", profile.resume);
      if (jobId) body.append("jobId", jobId); else if (jobDescription.trim()) body.append("jobDescription", jobDescription.trim());
      const result = await axios.post(`${API}/analyze`, body, { headers: { ...auth, "Idempotency-Key": requestId() }, timeout: 330000 });
      setLatest(result.data); setSelected(result.data); setNotice("Analysis saved to your resume history."); await load();
    } catch (e) {
      let message = requestErrorMessage(e, "Analysis could not be completed. Check the server error details and retry.");
      try {
        const { data = [] } = await axios.get(`${API}/history?limit=50`, { headers: auth });
        setHistory(data);
        const failed = data.find((item) => item.status === "FAILED" && item.resumeFilename === profile.resume);
        if (failed?.userMessage) message = failed.userMessage;
      } catch { /* Keep the original request error if history cannot be refreshed. */ }
      setError(message);
    }
    finally { setBusy(false); }
  };
  const openAnalysis = async (item) => {
    setSelected(item); setError("");
    if (item.analysis && Object.keys(item.analysis).length) return;
    try { const result = await axios.get(`${API}/history/${item.id}`, { headers: auth }); setSelected(result.data); }
    catch (e) { setError(e.response?.data?.message || "Could not open this saved analysis."); }
  };
  const runImprove = async () => {
    if (!originalText.trim()) { setError("Paste the original wording you want help improving."); return; }
    setImproving(true); setError(""); setImprovement(null);
    try { const { data } = await axios.post(`${API}/improve`, { section, originalText, instructions }, { headers: { ...auth, "Content-Type": "application/json" }, timeout: 120000 }); setImprovement(data); }
    catch (e) { setError(e.response?.data?.message || "Could not generate a suggestion. Please try again."); }
    finally { setImproving(false); }
  };
  const compare = async () => {
    if (!compareIds[0] || !compareIds[1] || compareIds[0] === compareIds[1]) return;
    setError(""); setComparison(null);
    try { const { data } = await axios.post(`${API}/compare`, { firstAnalysisId: Number(compareIds[0]), secondAnalysisId: Number(compareIds[1]) }, { headers: auth }); setComparison(data); }
    catch (e) { setError(e.response?.data?.message || "Could not compare these analyses."); }
  };

  const analysis = selected || latest;
  const details = analysis?.analysis || {};
  const categories = details.categories || {};
  const ats = details.atsAssessment || {};
  const sectionAnalysis = details.sections || {};
  const completedHistory = history.filter((item) => item.status === "COMPLETED");

  return <main className="resume-intel-page"><div className="resume-intel-shell">
    <header className="ri-hero"><div><span className="ri-eyebrow"><Sparkles size={14}/> RESUME INTELLIGENCE</span><h1>Make your resume work harder.</h1><p>Get structured feedback from your saved PDF, see how it aligns with a real role, and track improvements over time.</p></div><div className="ri-hero-icon"><FileSearch size={27}/></div></header>
    {error && <div className="ri-alert" role="alert"><span>{error}</span><button onClick={() => setError("")}>Dismiss</button></div>}{notice && <div className="ri-notice" role="status"><Check size={16}/>{notice}<button onClick={() => setNotice("")}>Dismiss</button></div>}
    <section className="ri-panel ri-run-panel"><div className="ri-section-heading"><div><span className="ri-eyebrow">ANALYZE YOUR SAVED RESUME</span><h2>{profile?.resume || "Resume not uploaded yet"}</h2><p>{profile?.resume ? "Analysis uses the PDF currently saved to your student profile." : "Upload a PDF from your profile page to start."}</p></div><button className="ri-button ri-button-primary" disabled={busy || loading || !profile?.resume} onClick={runAnalysis}>{busy ? <><LoaderCircle className="ri-spin" size={17}/> Analyzing PDF…</> : <><Sparkles size={17}/> Analyze resume</>}</button></div>
      <div className="ri-job-select"><label htmlFor="ri-job">Optional job-specific match</label><select id="ri-job" value={jobId} onChange={(e) => { setJobId(e.target.value); if (e.target.value) setJobDescription(""); }}><option value="">General resume analysis</option>{jobs.map((job) => <option key={job.id} value={job.id}>{job.title || "Role"} · {job.company || "Company"}</option>)}</select><span>Or paste a job description</span><textarea value={jobDescription} disabled={Boolean(jobId)} onChange={(e) => setJobDescription(e.target.value)} maxLength={20000} placeholder="Paste role requirements here. The analyzer will compare your resume with this text." /></div>
      <p className="ri-disclaimer"><Info size={14}/> Scores are AI-generated quality estimates calculated from validated category scores. They are not official ATS scores and do not guarantee selection.</p>
    </section>

    {loading ? <div className="ri-loading"><LoaderCircle className="ri-spin"/> Loading your saved analyses…</div> : <>
      <section className="ri-overview-grid"><article className="ri-panel ri-score-panel"><div className="ri-score-ring" style={{ "--score": `${analysis?.score || 0}%` }}><div><strong>{analysis?.score ?? "—"}</strong><span>/ 100</span></div></div><div><span className="ri-eyebrow">LATEST SAVED SCORE</span><h2>{analysis ? analysis.jobTitle ? `Match for ${analysis.jobTitle}` : "Resume quality estimate" : "No analysis yet"}</h2><p>{analysis ? `${analysis.resumeFilename} · ${analysis.analyzedAt ? new Date(analysis.analyzedAt).toLocaleString() : "Date unavailable"}` : "Run an analysis to see a real score and tailored feedback."}</p>{analysis?.jobMatchScore != null && <span className="ri-match-pill"><Target size={14}/> Job match {analysis.jobMatchScore}/100</span>}</div></article>
      <article className="ri-panel ri-trend-panel"><div className="ri-panel-title"><div><span className="ri-eyebrow">SAVED HISTORY</span><h2>Score trend</h2></div><History size={18}/></div>{trend.length ? <div className="ri-chart-wrap"><svg viewBox="0 0 500 120" role="img" aria-label="Saved resume score history"><line x1="12" y1="102" x2="488" y2="102"/><polyline points={trend.map((point, i) => `${trend.length === 1 ? 250 : 18 + i * (464 / (trend.length - 1))},${102 - Math.max(0, Math.min(100, point.score || 0)) * .84}`).join(" ")}/>{trend.map((point, i) => <g key={point.id}><circle cx={trend.length === 1 ? 250 : 18 + i * (464 / (trend.length - 1))} cy={102 - Math.max(0, Math.min(100, point.score || 0)) * .84} r="4"/><title>{`${point.score}/100 · ${new Date(point.analyzedAt).toLocaleDateString()}`}</title></g>)}</svg><div className="ri-chart-labels"><span>{trend.length === 1 ? "One saved analysis" : new Date(trend[0].analyzedAt).toLocaleDateString()}</span><strong>{trend.length > 1 ? `${trend.at(-1).score - trend[0].score > 0 ? "+" : ""}${trend.at(-1).score - trend[0].score} points` : `${trend[0].score}/100`}</strong><span>{trend.length > 1 ? new Date(trend.at(-1).analyzedAt).toLocaleDateString() : "No trend yet"}</span></div></div> : <p className="ri-empty">Your saved score history will appear here after the first analysis.</p>}</article></section>

      {analysis && <>
        <section className="ri-panel"><div className="ri-panel-title"><div><span className="ri-eyebrow">TRANSPARENT BREAKDOWN</span><h2>What contributes to this score</h2></div><span className="ri-model">{analysis.modelIdentifier || "Ollama"}</span></div><div className="ri-category-grid">{Object.entries(CATEGORY_LABELS).map(([key, label]) => { const item = categories[key]; return <article className="ri-category" key={key}><div><strong>{label}</strong><span>{item?.score === "" ? "Unscored" : `${item?.score ?? "—"} / ${item?.weight ?? "—"}`}</span></div><div className="ri-bar"><i style={{ width: `${item?.score !== "" && item?.score != null && item?.weight ? Math.max(0, Math.min(100, item.score / item.weight * 100)) : 0}%` }}/></div><p>{item?.rationale || (item?.evaluable === false ? "Not enough resume evidence to evaluate this category." : "No category detail was saved.")}</p>{item?.evidence?.length > 0 && <small>Evidence: {item.evidence.join(" · ")}</small>}</article>; })}</div><p className="ri-scoring-note">The backend totals validated category points and normalizes by categories with enough evidence. Categories that cannot be evaluated are shown as unscored instead of being treated as zero.</p></section>
        <section className="ri-insight-grid"><Insight title="Strengths" items={details.strengths} tone="good"/><Insight title="Weaknesses" items={details.weaknesses} tone="needs"/><Insight title="Actionable suggestions" items={details.improvementSuggestions} tone="action"/></section>
        <section className="ri-panel"><div className="ri-panel-title"><div><span className="ri-eyebrow">SECTION REVIEW</span><h2>Resume section analysis</h2></div><ChevronDown size={18}/></div><div className="ri-section-grid">{Object.entries(SECTION_LABELS).map(([key, label]) => { const item = sectionAnalysis[key]; return <article className="ri-section-card" key={key}><div><strong>{label}</strong><span className={`ri-status ri-status-${String(item?.status || "missing").toLowerCase().replaceAll(" ", "-")}`}>{item?.status || "Not evaluated"}</span></div><p>{item?.explanation || "No section details were returned."}</p>{item?.suggestion && <small>{item.suggestion}</small>}</article>; })}</div></section>
        <section className="ri-panel"><div className="ri-panel-title"><div><span className="ri-eyebrow">PARSING READABILITY ESTIMATE</span><h2>ATS-style review</h2></div><Info size={18}/></div><div className="ri-ats-overview"><strong>Text review</strong><p>Checks extracted text, headings, formatting risks, contact readability, dates, and role keyword relevance.</p></div><div className="ri-ats-grid">{[["Text extraction",ats.extractionQuality],["Section headings",ats.headingQuality],["Formatting risks",list(ats.formattingRisks).length ? `${ats.formattingRisks.length} noted` : "None reported"],["Complex layout risks",list(ats.layoutRisks).length ? `${ats.layoutRisks.length} noted` : "None reported"],["Unusual formatting",list(ats.unusualFormatting).length ? `${ats.unusualFormatting.length} noted` : "None reported"],["Contact readability",ats.contactReadability],["Date consistency",ats.dateConsistency],["Keyword relevance",ats.keywordRelevance]].map(([label,value]) => <div key={label}><span>{label}</span><b>{value || "Not reported"}</b></div>)}</div>{list(ats.formattingRisks).length + list(ats.layoutRisks).length + list(ats.unusualFormatting).length > 0 && <ul className="ri-list">{[...list(ats.formattingRisks),...list(ats.layoutRisks),...list(ats.unusualFormatting)].map((x,i)=><li key={i}>{x}</li>)}</ul>}<p className="ri-scoring-note">{list(ats.limitations).join(" ") || "Different employers use different ATS products. This is an estimated parsing review, not a simulation of a particular ATS and cannot predict whether a resume will pass."}</p></section>
        {details.jobMatch && <section className="ri-panel"><div className="ri-panel-title"><div><span className="ri-eyebrow">ROLE ALIGNMENT</span><h2>{analysis.jobTitle || "Job-specific match"}</h2></div><strong className="ri-job-score">{analysis.jobMatchScore ?? details.jobMatch.score ?? "—"}<small>/100</small></strong></div><div className="ri-insight-grid ri-job-insights"><Insight title="Matched keywords" items={details.jobMatch.matchedKeywords} tone="good"/><Insight title="Missing keywords" items={details.jobMatch.missingKeywords} tone="needs"/><Insight title="Tailoring suggestions" items={details.jobMatch.suggestions} tone="action"/></div><p className="ri-scoring-note">Only role terms present in the selected job or pasted description are compared. Missing keywords are suggestions to consider only when they accurately describe your experience.</p></section>}
      </>}
    </>}

    <section className="ri-panel ri-improve"><div className="ri-panel-title"><div><span className="ri-eyebrow">KEEP YOUR ORIGINAL IN CONTROL</span><h2>Resume improvement assistant</h2><p>Generate a wording suggestion for review. Nothing is changed in your uploaded PDF.</p></div><WandSparkles size={20}/></div><div className="ri-improve-form"><label>Section<select value={section} onChange={(e) => { setSection(e.target.value); setImprovement(null); }}><option value="professionalSummary">Professional summary</option><option value="projects">Project description</option><option value="experience">Experience bullet</option><option value="technicalSkills">Technical skills</option><option value="achievements">Achievements</option><option value="education">Education</option></select></label><label>Original wording<textarea value={originalText} onChange={(e) => setOriginalText(e.target.value)} maxLength={10000} placeholder="Paste the truthful content you want to improve…"/></label><label>Extra guidance (optional)<input value={instructions} maxLength={1000} onChange={(e) => setInstructions(e.target.value)} placeholder="For example: make this concise and suitable for a graduate role"/></label><button className="ri-button ri-button-primary" onClick={runImprove} disabled={improving}>{improving ? <><LoaderCircle className="ri-spin" size={16}/> Generating…</> : <><WandSparkles size={16}/> Suggest improvement</>}</button></div>{improvement && <div className="ri-before-after"><article><h3>Before</h3><p>{improvement.before}</p></article><article><h3>Suggested version</h3><p>{improvement.suggestedVersion}</p><button className="ri-copy" onClick={async () => { await navigator.clipboard.writeText(improvement.suggestedVersion); setNotice("Suggestion copied to clipboard."); }}><Clipboard size={14}/> Copy suggestion</button></article><p className="ri-scoring-note">{improvement.truthfulnessNote || "Review every suggestion and keep only details that are accurate for you."}{list(improvement.questionsToProvide).length > 0 && ` Questions to answer: ${improvement.questionsToProvide.join(" · ")}`}</p></div>}</section>

    <section className="ri-panel"><div className="ri-panel-title"><div><span className="ri-eyebrow">YOUR SAVED ANALYSES</span><h2>History and comparison</h2></div><History size={18}/></div>{completedHistory.length ? <><div className="ri-history-list">{completedHistory.map((item) => <button key={item.id} className={`ri-history-row ${selected?.id === item.id ? "is-selected" : ""}`} onClick={() => openAnalysis(item)}><span className="ri-history-icon"><FileSearch size={16}/></span><span><strong>{item.resumeFilename}</strong><small>{new Date(item.analyzedAt).toLocaleString()}{item.jobTitle ? ` · ${item.jobTitle}` : " · General review"}</small></span><b>{item.score ?? "—"}<small>/100</small></b></button>)}</div>{completedHistory.length > 1 && <div className="ri-compare-controls"><span>Compare two saved analyses</span>{[0,1].map((index) => <select key={index} aria-label={`Analysis ${index + 1}`} value={compareIds[index]} onChange={(e) => setCompareIds((old) => old.map((v, i) => i === index ? e.target.value : v))}><option value="">Choose analysis {index + 1}</option>{completedHistory.map((item) => <option key={item.id} value={item.id}>{item.score}/100 · {new Date(item.analyzedAt).toLocaleDateString()}</option>)}</select>)}<button className="ri-button ri-button-secondary" onClick={compare} disabled={!compareIds[0] || !compareIds[1] || compareIds[0] === compareIds[1]}>Compare</button></div>}{comparison && <div className="ri-comparison"><h3>Score change: {comparison.scoreChange > 0 ? <ArrowUpRight size={17}/> : comparison.scoreChange < 0 ? <ArrowDownRight size={17}/> : null} {comparison.scoreChange > 0 ? "+" : ""}{comparison.scoreChange} points</h3><div>{Object.entries(comparison.categoryChanges || {}).map(([key, value]) => <p key={key}><span>{CATEGORY_LABELS[key] || key}</span><strong>{value.before} → {value.after} {typeof value.change === "number" && `(${value.change > 0 ? "+" : ""}${value.change})`}</strong></p>)}</div><small>Remaining issues: {list(comparison.remainingWeaknesses).join(" · ") || "No saved weaknesses"}</small></div>}</> : <p className="ri-empty">No completed analysis is saved yet. After your first run, you can reopen, compare, and track it here.</p>}</section>
  </div></main>;
}

function Insight({ title, items, tone }) { return <article className={`ri-panel ri-insight ri-insight-${tone}`}><h3>{title}</h3>{list(items).length ? <ul className="ri-list">{items.map((item, i) => <li key={i}>{typeof item === "string" ? item : item?.text || item?.description || JSON.stringify(item)}</li>)}</ul> : <p>No items were identified in the saved analysis.</p>}</article>; }
