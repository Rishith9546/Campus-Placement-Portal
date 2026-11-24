import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Activity, ArrowRight, CalendarDays, Check, CheckCircle2, ChevronRight, Circle, Clock3, FileText, ListChecks, LoaderCircle, Plus, RefreshCw, RotateCcw, Sparkles, Target, Trash2, X } from "lucide-react";
import "./PreparationRoadmap.css";

const API = "http://localhost:8080/api/student/roadmaps";
const iso = (date) => { const d = new Date(date); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
const localDate = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
const emptyTask = (date) => ({ title: "", description: "", category: "GENERAL", topic: "", priority: "MEDIUM", estimatedMinutes: 30, scheduledDate: date, resourceLink: "", notes: "" });

export default function PreparationRoadmap() {
  const [token] = useState(() => localStorage.getItem("token"));
  const [roadmap, setRoadmap] = useState(null);
  const [history, setHistory] = useState([]);
  const [weekly, setWeekly] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [config, setConfig] = useState({ durationWeeks: 2, dailyMinutes: "120", customMinutes: "60", startDate: localDate(), focus: "" });
  const [form, setForm] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [filters, setFilters] = useState({ status: "", category: "", priority: "", from: "", to: "" });

  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);
  const load = useCallback(async (roadmapId = null) => {
    setLoading(true); setError("");
    if (!token) { setError("Sign in as a student to view your preparation roadmap."); setLoading(false); return; }
    try {
      const [activeResult, historyResult] = await Promise.all([
        roadmapId ? axios.get(`${API}/${roadmapId}`, { headers }) : axios.get(`${API}/active`, { headers }),
        axios.get(`${API}/history`, { headers }),
      ]);
      const current = activeResult.data || null;
      setRoadmap(current); setHistory(historyResult.data || []); setSelectedHistory(roadmapId);
      if (current?.status === "ACTIVE") {
        const start = new Date(); start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
        const stats = await axios.get(`${API}/${current.id}/weekly?weekStart=${iso(start)}`, { headers }); setWeekly(stats.data);
      } else setWeekly(null);
    } catch (e) { setError(e.response?.data?.message || "Could not load roadmap data."); }
    finally { setLoading(false); }
  }, [token, headers]);
  useEffect(() => { load(); }, [load]);

  const saveRoadmap = async (event) => {
    event.preventDefault(); setGenerating(true); setError(""); setNotice("");
    try {
      const response = await axios.post(API, { durationWeeks: Number(config.durationWeeks), dailyMinutes: Number(config.dailyMinutes === "custom" ? config.customMinutes : config.dailyMinutes), startDate: config.startDate, focus: config.focus.trim() || null }, { headers });
      setNotice(response.data.plannerSource === "OLLAMA" ? "Your roadmap is saved. Ollama helped phrase the tasks; task priorities and timing came from your saved data and selected schedule." : "Your roadmap is saved using the deterministic planner. Ollama was unavailable, so the system used its rule-based recommendations.");
      await load(response.data.id);
    } catch (e) { setError(e.response?.data?.message || "Could not generate your roadmap."); }
    finally { setGenerating(false); }
  };
  const adapt = async (mode) => {
    if (!roadmap || !window.confirm(mode === "NEW_ROADMAP" ? "Archive this plan and start a new roadmap? Completed task history will remain saved." : mode === "REPLACE_FUTURE" ? "Replace future incomplete tasks using your current preparation data? Completed tasks will remain saved." : "Add new recommendations from your current data while keeping existing tasks?")) return;
    setGenerating(true); setError("");
    try { const { data } = await axios.post(`${API}/${roadmap.id}/adapt`, { mode }, { headers }); setNotice(data.plannerSource === "OLLAMA" ? "Future recommendations updated with your current saved data." : "Future recommendations updated with the deterministic fallback planner."); await load(data.id); }
    catch (e) { setError(e.response?.data?.message || "Could not adapt the roadmap."); }
    finally { setGenerating(false); }
  };
  const updateTaskStatus = async (task, status) => {
    const skipReason = status === "SKIPPED" ? (window.prompt("Optional: why are you skipping this task?", "") || "") : null;
    setError("");
    try { await axios.put(`${API}/tasks/${task.id}/status`, { status, skipReason }, { headers }); await load(roadmap.id); }
    catch (e) { setError(e.response?.data?.message || "Could not update task status."); }
  };
  const reschedule = async (task) => {
    const date = window.prompt("New date (YYYY-MM-DD)", task.scheduledDate);
    if (!date || date === task.scheduledDate) return;
    setError(""); try { await axios.put(`${API}/tasks/${task.id}/reschedule`, { scheduledDate: date }, { headers }); await load(roadmap.id); }
    catch (e) { setError(e.response?.data?.message || "Could not reschedule this task."); }
  };
  const editTask = async (event) => {
    event.preventDefault(); if (!roadmap || !form) return;
    setError("");
    try {
      if (editingTask) await axios.put(`${API}/tasks/${editingTask.id}`, form, { headers });
      else await axios.post(`${API}/${roadmap.id}/tasks`, form, { headers });
      setForm(null); setEditingTask(null); await load(roadmap.id);
    } catch (e) { setError(e.response?.data?.message || "Could not save this task."); }
  };
  const removeTask = async (task) => {
    if (!window.confirm(`Delete personal task -${task.title}-?`)) return;
    try { await axios.delete(`${API}/tasks/${task.id}`, { headers }); await load(roadmap.id); }
    catch (e) { setError(e.response?.data?.message || "Could not delete this task."); }
  };
  const saveNotes = async (task) => {
    const notes = window.prompt("Your notes for this task", task.notes || ""); if (notes == null) return;
    try { await axios.put(`${API}/tasks/${task.id}/notes`, { notes }, { headers }); await load(roadmap.id); }
    catch (e) { setError(e.response?.data?.message || "Could not save task notes."); }
  };
  const openEdit = (task) => { setEditingTask(task); setForm({ title: task.title, description: task.description, category: task.category, topic: task.topic || "", priority: task.priority, estimatedMinutes: task.estimatedMinutes, scheduledDate: task.scheduledDate, resourceLink: task.resourceLink || "", notes: task.notes || "" }); };
  const tasks = roadmap?.tasks || [];
  const today = localDate();
  const visibleTasks = tasks.filter((task) => (!filters.status || task.status === filters.status) && (!filters.category || task.category === filters.category) && (!filters.priority || task.priority === filters.priority) && (!filters.from || task.scheduledDate >= filters.from) && (!filters.to || task.scheduledDate <= filters.to));
  const todayTasks = visibleTasks.filter((task) => task.scheduledDate === today && !["COMPLETED", "SKIPPED"].includes(task.status));
  const upcoming = visibleTasks.filter((task) => task.scheduledDate > today && !["COMPLETED", "SKIPPED"].includes(task.status));
  const overdue = visibleTasks.filter((task) => task.scheduledDate < today && ["TODO", "IN_PROGRESS"].includes(task.status));
  const finished = visibleTasks.filter((task) => ["COMPLETED", "SKIPPED"].includes(task.status));
  const readOnly = selectedHistory != null && roadmap?.status !== "ACTIVE";

  return <main className="roadmap-page"><div className="roadmap-shell">
    <header className="roadmap-hero"><div><span className="rm-eyebrow"><Target size={14}/> PERSONAL PLACEMENT PREPARATION</span><h1>Your preparation roadmap</h1><p>A study plan built from your saved preparation activity, resume feedback, profile, and current job skill gaps.</p></div><div className="rm-hero-symbol"><Activity size={27}/></div></header>
    {error && <div className="rm-alert" role="alert">{error}<button onClick={() => setError("")}>Dismiss</button></div>}{notice && <div className="rm-notice" role="status">{notice}<button onClick={() => setNotice("")}>Dismiss</button></div>}
    {loading ? <div className="rm-loading"><LoaderCircle className="rm-spin"/> Loading roadmap-</div> : !roadmap ? <section className="rm-panel rm-setup"><span className="rm-eyebrow">BUILD YOUR PLAN</span><h2>Choose a realistic schedule</h2><p>The planner uses only saved activity. Unassessed areas are identified without assigning them a zero score.</p><form onSubmit={saveRoadmap} className="rm-config-grid"><label>Plan length<select value={config.durationWeeks} onChange={(e)=>setConfig({...config,durationWeeks:e.target.value})}><option value="1">1 week</option><option value="2">2 weeks</option><option value="4">4 weeks</option></select></label><label>Study time each day<select value={config.dailyMinutes} onChange={(e)=>setConfig({...config,dailyMinutes:e.target.value})}><option value="60">1 hour</option><option value="120">2 hours</option><option value="180">3 hours</option><option value="custom">Custom minutes</option></select></label>{config.dailyMinutes==="custom"&&<label>Custom time in minutes<input type="number" min="15" max="480" step="15" value={config.customMinutes} onChange={(e)=>setConfig({...config,customMinutes:e.target.value})}/></label>}<label>Start date<input type="date" min={today} value={config.startDate} onChange={(e)=>setConfig({...config,startDate:e.target.value})}/></label><label className="rm-wide">Preparation focus<select value={config.focus} onChange={(e)=>setConfig({...config,focus:e.target.value})}><option value="">Overall placement preparation</option><option value="DSA">DSA</option><option value="APTITUDE">Aptitude</option><option value="TECHNICAL">Technical subjects</option><option value="RESUME">Resume</option><option value="JOB_SKILLS">Job skills</option></select>{config.focus==="TECHNICAL"&&<small>No saved technical assessment is available yet. The planner will only use other real preparation signals.</small>}</label><div className="rm-wide rm-form-foot"><span>Daily planned work will not exceed {config.dailyMinutes==="custom"?config.customMinutes:config.dailyMinutes} minutes.</span><button className="rm-button rm-primary" type="submit" disabled={generating}>{generating?<><LoaderCircle className="rm-spin"/> Planning-</>:<><Sparkles size={16}/> Generate my roadmap</>}</button></div></form></section> : <>
      <section className="rm-panel rm-plan-overview"><div className="rm-plan-title"><div><span className="rm-eyebrow">{roadmap.status} ROADMAP - {roadmap.plannerSource==="OLLAMA"?"AI ASSISTED":"RULE-BASED PLAN"}</span><h2>{roadmap.name}</h2><p>{roadmap.startDate} - {roadmap.durationWeeks} week{roadmap.durationWeeks>1?"s":""} - up to {roadmap.dailyMinutes} min/day{roadmap.focus?` - Focus: ${roadmap.focus}`:""}</p></div>{!readOnly&&<div className="rm-plan-actions"><button className="rm-button rm-secondary" disabled={generating} onClick={()=>adapt("CONTINUE")}><RefreshCw size={15}/> Adjust future</button><button className="rm-button rm-secondary" disabled={generating} onClick={()=>adapt("REPLACE_FUTURE")}>Replace future tasks</button><button className="rm-button rm-secondary" disabled={generating} onClick={()=>adapt("NEW_ROADMAP")}>Start new roadmap</button></div>}</div><div className="rm-progress-row"><div className="rm-progress-track"><i style={{width:`${roadmap.completionPercentage}%`}}/></div><strong>{roadmap.completedTasks}/{roadmap.totalTasks} complete</strong><span>{roadmap.completionPercentage}%</span></div><div className="rm-summary-grid"><Metric icon={<ListChecks/>} label="Planned tasks" value={roadmap.totalTasks}/><Metric icon={<CheckCircle2/>} label="Completed" value={roadmap.completedTasks}/><Metric icon={<Clock3/>} label="Study time planned" value={`${tasks.filter(t=>t.status==="TODO"||t.status==="IN_PROGRESS").reduce((n,t)=>n+t.estimatedMinutes,0)} min left`}/><Metric icon={<CalendarDays/>} label="Missed" value={weekly?.missedTasks ?? 0}/></div></section>
      <section className="rm-panel"><div className="rm-panel-heading"><div><span className="rm-eyebrow">PLACEMENT READINESS INPUT SNAPSHOT</span><h2>Starting point for this plan</h2></div><Target size={19}/></div><div className="rm-baseline-grid">{Object.entries(roadmap.preparationSnapshot?.readinessInputs||{}).filter(([key])=>key!=="note").map(([key,value])=><div className="rm-baseline-item" key={key}><span>{key.replace(/([A-Z])/g," $1").replace(/^./,s=>s.toUpperCase())}</span><strong>{typeof value==="number"?`${value}${key.includes("Percentage")?"%":""}`:value}</strong></div>)}</div><p className="rm-muted">{roadmap.preparationSnapshot?.readinessInputs?.note || "This snapshot is informational. Completing roadmap tasks alone does not change your readiness score; only updated underlying preparation records can do that."}</p></section>
      {roadmap.plannerSource==="DETERMINISTIC"&&<div className="rm-fallback"><InfoIcon/> Ollama was unavailable or returned an invalid plan description. Task selection and priorities were created by the deterministic backend planner.</div>}
      <section className="rm-panel"><div className="rm-panel-heading"><div><span className="rm-eyebrow">YOUR PREPARATION TASKS</span><h2>Today and what-s next</h2></div>{!readOnly&&<button className="rm-button rm-primary" onClick={()=>{setEditingTask(null);setForm(emptyTask(today));}}><Plus size={16}/> Add personal task</button>}</div><div className="rm-filters" aria-label="Filter roadmap tasks"><label>Status<select value={filters.status} onChange={e=>setFilters({...filters,status:e.target.value})}><option value="">All statuses</option>{["TODO","IN_PROGRESS","COMPLETED","SKIPPED"].map(x=><option key={x} value={x}>{x.replaceAll("_"," ")}</option>)}</select></label><label>Category<select value={filters.category} onChange={e=>setFilters({...filters,category:e.target.value})}><option value="">All categories</option>{["DSA","APTITUDE","TECHNICAL","RESUME","JOB_SKILLS","INTERVIEW_PREPARATION","PROFILE","GENERAL"].map(x=><option key={x}>{x}</option>)}</select></label><label>Priority<select value={filters.priority} onChange={e=>setFilters({...filters,priority:e.target.value})}><option value="">All priorities</option>{["HIGH","MEDIUM","LOW"].map(x=><option key={x}>{x}</option>)}</select></label><label>From<input type="date" value={filters.from} onChange={e=>setFilters({...filters,from:e.target.value})}/></label><label>To<input type="date" value={filters.to} onChange={e=>setFilters({...filters,to:e.target.value})}/></label><button className="rm-link" onClick={()=>setFilters({status:"",category:"",priority:"",from:"",to:""})}>Clear filters</button></div>{todayTasks.length===0&&overdue.length===0&&upcoming.length===0&&finished.length===0&&<p className="rm-empty">No tasks match these filters.</p>}{overdue.length>0&&<TaskGroup title="Needs attention" subtitle="Past due, still open" tasks={overdue} onStatus={updateTaskStatus} onReschedule={reschedule} onNotes={saveNotes} onEdit={openEdit} onDelete={removeTask} readOnly={readOnly}/>}<TaskGroup title="Today" subtitle={new Date().toLocaleDateString(undefined,{weekday:"long",month:"short",day:"numeric"})} tasks={todayTasks} onStatus={updateTaskStatus} onReschedule={reschedule} onNotes={saveNotes} onEdit={openEdit} onDelete={removeTask} readOnly={readOnly}/><TaskGroup title="Upcoming" subtitle={`${upcoming.length} open task${upcoming.length===1?"":"s"}`} tasks={upcoming} onStatus={updateTaskStatus} onReschedule={reschedule} onNotes={saveNotes} onEdit={openEdit} onDelete={removeTask} readOnly={readOnly}/><TaskGroup title="Completed and skipped" subtitle={`${finished.length} recorded`} tasks={finished} onStatus={updateTaskStatus} onReschedule={reschedule} onNotes={saveNotes} onEdit={openEdit} onDelete={removeTask} readOnly={readOnly}/></section>
      {weekly&&<section className="rm-panel"><div className="rm-panel-heading"><div><span className="rm-eyebrow">WEEKLY REVIEW - {weekly.weekStart} - {weekly.weekEnd}</span><h2>Progress from saved records</h2></div><Activity size={20}/></div><div className="rm-summary-grid"><Metric label="Tasks completed" value={`${weekly.completedTasks}/${weekly.plannedTasks}`}/><Metric label="Completion" value={`${weekly.completionPercentage}%`}/><Metric label="Planned study" value={`${weekly.plannedStudyMinutes} min`}/><Metric label="Actual study time" value="Not tracked"/></div><div className="rm-week-grid"><div><h3>Task categories</h3>{Object.keys(weekly.categoryTaskCounts||{}).length?Object.entries(weekly.categoryTaskCounts).map(([category,count])=><p className="rm-category-line" key={category}><span>{category.replaceAll("_"," ")}</span><b>{count}</b></p>):<p className="rm-empty">No tasks planned for this week.</p>}<p className="rm-muted">Actual study time is not recorded by the current preparation modules. Planned minutes are estimates, not actual time.</p></div><div><h3>Observed module data</h3>{Object.entries(weekly.moduleAvailability||{}).map(([name,status])=><p className="rm-availability" key={name}><span>{name.replaceAll(/([A-Z])/g," $1").replace(/^./,s=>s.toUpperCase())}</span><b className={status==="TRACKED"?"is-tracked":""}>{status.replaceAll("_"," ")}</b></p>)}<p className="rm-muted">Technical assessment and persisted mock interview scores are unavailable; they are not treated as low scores.</p></div></div>{weekly.dsaTopicsWorked?.length>0&&<p className="rm-observed"><CheckCircle2 size={15}/> DSA problems marked solved this week: {weekly.dsaTopicsWorked.join(", ")}</p>}{weekly.currentWeakAreas?.length>0&&<p className="rm-observed rm-observed-warn">Current focus signals: {weekly.currentWeakAreas.join(" - ")}</p>}{Object.entries(weekly.moduleChanges||{}).filter(([,v])=>typeof v==="number").map(([key,value])=><p className="rm-observed" key={key}>{key==="resumeScoreChange"?"Resume score change between latest saved analyses":"Accuracy change between latest aptitude attempts"}: {value>0?"+":""}{value} points</p>)}</section>}
    </>}

    <section className="rm-panel rm-history"><div className="rm-panel-heading"><div><span className="rm-eyebrow">ROADMAP ARCHIVE</span><h2>Previous plans</h2></div><FileText size={18}/></div>{history.length?history.map((item)=><button key={item.id} className={`rm-history-row ${selectedHistory===item.id?"selected":""}`} onClick={()=>load(item.id)}><span><strong>{item.name}</strong><small>{item.createdAt?new Date(item.createdAt).toLocaleDateString():""} - {item.status} - {item.completedTasks}/{item.totalTasks} complete</small></span><b>{item.completionPercentage}%</b><ChevronRight size={15}/></button>):<p className="rm-empty">Previous roadmaps will be listed here after you create one.</p>}{selectedHistory&&roadmap&&roadmap.status!=="ACTIVE"&&<button className="rm-link" onClick={()=>load()}>Return to active roadmap <ArrowRight size={15}/></button>}</section>
    </div>
    {form&&<div className="rm-modal-backdrop" role="presentation" onMouseDown={(e)=>e.target===e.currentTarget&&(setForm(null),setEditingTask(null))}><form className="rm-task-modal" onSubmit={editTask}><div className="rm-modal-head"><div><span className="rm-eyebrow">{editingTask?"EDIT TASK":"PERSONAL TASK"}</span><h2>{editingTask?"Update task":"Create a task"}</h2></div><button type="button" onClick={()=>{setForm(null);setEditingTask(null)}} aria-label="Close"><X size={18}/></button></div><label>Title<input required maxLength={180} value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></label><label>Description<textarea required maxLength={5000} value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label><div className="rm-modal-grid"><label>Category<select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{["DSA","APTITUDE","TECHNICAL","RESUME","JOB_SKILLS","INTERVIEW_PREPARATION","PROFILE","GENERAL"].map(x=><option key={x}>{x}</option>)}</select></label><label>Priority<select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}>{["HIGH","MEDIUM","LOW"].map(x=><option key={x}>{x}</option>)}</select></label><label>Topic<input maxLength={120} value={form.topic} onChange={e=>setForm({...form,topic:e.target.value})}/></label><label>Minutes<input type="number" min="5" max="480" value={form.estimatedMinutes} onChange={e=>setForm({...form,estimatedMinutes:Number(e.target.value)})}/></label><label>Date<input type="date" value={form.scheduledDate} onChange={e=>setForm({...form,scheduledDate:e.target.value})}/></label><label>Resource link<input type="url" value={form.resourceLink} onChange={e=>setForm({...form,resourceLink:e.target.value})}/></label></div><label>Notes<textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/></label><div className="rm-modal-actions"><button type="button" className="rm-button rm-secondary" onClick={()=>{setForm(null);setEditingTask(null)}}>Cancel</button><button className="rm-button rm-primary" type="submit">Save task</button></div></form></div>}
  </main>;
}

function TaskGroup({title,subtitle,tasks,onStatus,onReschedule,onNotes,onEdit,onDelete,readOnly}) { if(!tasks.length)return null;return <div className="rm-task-group"><div className="rm-group-head"><h3>{title}</h3><span>{subtitle}</span></div><div className="rm-task-list">{tasks.map((task)=><article className={`rm-task-card ${task.status==="COMPLETED"?"done":""}`} key={task.id}><button className="rm-check" disabled={readOnly} onClick={()=>onStatus(task,task.status==="COMPLETED"||task.status==="SKIPPED"?"TODO":"COMPLETED")} aria-label={task.status==="COMPLETED"||task.status==="SKIPPED"?"Reopen task":"Mark task complete"}>{task.status==="COMPLETED"?<Check size={16}/>:task.status==="SKIPPED"?<RotateCcw size={15}/>:<Circle size={17}/>}</button><div className="rm-task-main"><div className="rm-task-meta"><span className={`rm-priority priority-${task.priority.toLowerCase()}`}>{task.priority} - {task.priorityScore}/100</span><span>{task.category.replaceAll("_"," ")}</span>{task.topic&&<span>{task.topic.replaceAll("_"," ")}</span>}<span><Clock3 size={12}/>{task.estimatedMinutes} min</span></div><h4>{task.title}</h4><p>{task.description}</p><small className="rm-reason">Why: {task.recommendationReason}</small>{task.status==="SKIPPED"&&task.skipReason&&<small className="rm-reason">Skipped: {task.skipReason}</small>}{task.notes&&<small className="rm-task-notes">Notes: {task.notes}</small>}<div className="rm-task-footer"><span>{task.scheduledDate} - {task.taskType.replaceAll("_"," ").toLowerCase()}</span>{task.resourceLink&&<a href={task.resourceLink} target="_blank" rel="noreferrer">Open resource</a>}</div></div>{!readOnly&&<div className="rm-task-actions">{task.status==="TODO"&&<button onClick={()=>onStatus(task,"IN_PROGRESS")} title="Start task">Start</button>}{(task.status==="TODO"||task.status==="IN_PROGRESS")&&<><button onClick={()=>onReschedule(task)} title="Reschedule"><CalendarDays size={14}/></button><button onClick={()=>onNotes(task)} title="Add notes"><FileText size={14}/></button>{task.taskType==="STUDENT_CREATED"&&<><button onClick={()=>onEdit(task)} title="Edit"><ListChecks size={14}/></button><button className="rm-delete" onClick={()=>onDelete(task)} title="Delete"><Trash2 size={14}/></button></>}<button className="rm-skip" onClick={()=>onStatus(task,"SKIPPED")} title="Skip task">Skip</button></>}{task.status==="COMPLETED"&&<button onClick={()=>onStatus(task,"TODO")} title="Reopen"><RotateCcw size={14}/></button>}{task.status==="SKIPPED"&&<button onClick={()=>onStatus(task,"TODO")} title="Reopen"><RotateCcw size={14}/></button>}</div>}</article>)}</div></div>; }
function Metric({icon,label,value}){return <article className="rm-metric">{icon&&<span>{icon}</span>}<small>{label}</small><strong>{value}</strong></article>}
function InfoIcon(){return <span className="rm-info-icon">i</span>}
