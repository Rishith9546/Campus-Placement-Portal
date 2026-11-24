
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Bell, BriefcaseBusiness, CalendarDays, CheckCircle2, Clock3, FileText, MessageCircle, Send, Sparkles, TrendingUp, UserRound } from "lucide-react";
import "./StudentDashBoard.css";
import { Headers } from "./Headers.jsx";

const jobIsOpen = (job, now = new Date()) => !job.deadline || new Date(`${job.deadline}T23:59:59`) >= now;
const normalize = (value) => (value || "").toString().toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

function assessJobEligibility(job, student) {
    const criteria = (job.eligibility || "").trim();
    if (!criteria) return "check";

    const branchGroups = [
        ["cse", "computer science", "computer science and engineering", "computer science engineering"],
        ["ece", "electronics", "electronics and communication"],
        ["eee", "electrical and electronics"],
        ["ee", "electrical engineering"],
        ["it", "information technology"],
        ["me", "mechanical engineering", "mechanical"],
        ["ce", "civil engineering", "civil"]
    ];
    const normalizedCriteria = normalize(criteria);
    const branchCriteria = branchGroups.filter((group) => group.some((name) => {
        const normalizedName = normalize(name);
        return name.length <= 3
            ? new RegExp(`\\b${name}\\b`, "i").test(criteria)
            : normalizedCriteria.includes(normalizedName);
    }));

    if (/branches?/i.test(criteria) && branchCriteria.length === 0) return "check";
    if (branchCriteria.length && !student.branch) return "check";
    if (branchCriteria.length && student.branch) {
        const studentBranch = normalize(student.branch);
        const matchingBranch = branchCriteria.some((group) => group.some((name) => {
            const normalizedName = normalize(name);
            return studentBranch === normalizedName || studentBranch.includes(normalizedName) || normalizedName.includes(studentBranch);
        }));
        if (!matchingBranch) return "not-eligible";
    } else if (/branches?/i.test(criteria) && !student.branch) {
        return "check";
    }

    const cgpaMatch = criteria.match(/(?:minimum|min\.?|at least|>=|>)\s*(?:cgpa|gpa)?\s*(\d+(?:\.\d+)?)/i)
        || criteria.match(/(?:cgpa|gpa)\s*(?:of|is|:|>=|>|minimum|min\.?|at least)?\s*(\d+(?:\.\d+)?)/i);
    if (cgpaMatch) {
        if (student.cgpa === "" || student.cgpa == null) return "check";
        const strictMinimum = /(?:^|\s)>\s*(?:cgpa|gpa)?/i.test(criteria);
        if (strictMinimum ? Number(student.cgpa) <= Number(cgpaMatch[1]) : Number(student.cgpa) < Number(cgpaMatch[1])) return "not-eligible";
    }

    let unverifiedCriteria = criteria;
    branchGroups.flat().forEach((name) => {
        const pattern = name.length <= 3 ? new RegExp(`\\b${name}\\b`, "gi") : new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
        unverifiedCriteria = unverifiedCriteria.replace(pattern, " ");
    });
    unverifiedCriteria = unverifiedCriteria
        .replace(/(?:minimum|min\.?|at least|>=|>)\s*(?:cgpa|gpa)?\s*\d+(?:\.\d+)?/gi, " ")
        .replace(/(?:cgpa|gpa)\s*(?:of|is|:|>=|>|minimum|min\.?|at least)?\s*\d+(?:\.\d+)?/gi, " ")
        .replace(/\b(branch(?:es)?|cgpa|gpa|with|and|or|of|is|at least|minimum|min)\b/gi, " ");
    return normalize(unverifiedCriteria) ? "check" : "eligible";
}

function getSkillMatch(job, student) {
    const requiredSkills = (job.skills || "").split(/[,;\n]+/).map(normalize).filter(Boolean);
    const studentSkills = (student.skills || "").split(/[,;\n]+/).map(normalize).filter(Boolean);
    if (!requiredSkills.length || !studentSkills.length) return 0;
    return requiredSkills.filter((required) => studentSkills.some((skill) => skill === required || skill.includes(required) || required.includes(skill))).length / requiredSkills.length;
}

function StudentDashboard() {
    const navigate = useNavigate();

    const [student, setStudent] = useState({
        id: null,
        name: "",
        email: "",
        rollNo: "",
        phone: "",
        branch: "",
        cgpa: "",
        skills: "",
        profilePhoto: null,
        resume: null
    });

    const [profilePhoto, setProfilePhoto] = useState(null);
    const [photoUploading, setPhotoUploading] = useState(false);
    const [photoMessage, setPhotoMessage] = useState("");
    const [photoMessageType, setPhotoMessageType] = useState("success");
    const [showEdit, setShowEdit] = useState(false);
    const [profileFormError, setProfileFormError] = useState("");
    const [showResumeAnalyzer, setShowResumeAnalyzer] = useState(false);

    const [jobDescription, setJobDescription] = useState("");
    const [response, setResponse] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [analyzerError, setAnalyzerError] = useState("");

    const [formData, setFormData] = useState({
        rollNo: "",
        phone: "",
        branch: "",
        cgpa: "",
        skills: ""
    });

    const [loading, setLoading] = useState(true);
    const [profileError, setProfileError] = useState("");
    const [applications, setApplications] = useState([]);
    const [applicationsLoading, setApplicationsLoading] = useState(false);
    const [applicationsError, setApplicationsError] = useState("");
    const [jobs, setJobs] = useState([]);
    const [jobsLoading, setJobsLoading] = useState(true);
    const [jobsError, setJobsError] = useState("");

    useEffect(() => {
        const getStudentProfile = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(
                    "http://localhost:8080/api/student/profile",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                setStudent({
                    id: response.data.id ?? null,
                    name: response.data.name ?? "",
                    email: response.data.email ?? "",
                    rollNo: response.data.rollNo ?? "",
                    phone: response.data.phone ?? "",
                    branch: response.data.branch ?? "",
                    cgpa: response.data.cgpa ?? "",
                    skills: response.data.skills ?? "",
                    profilePhoto: response.data.profilePhoto ?? null,
                    resume: response.data.resume ?? null
                });

                setFormData({
                    rollNo: response.data.rollNo || "",
                    phone: response.data.phone || "",
                    branch: response.data.branch || "",
                    cgpa: response.data.cgpa || "",
                    skills: response.data.skills || ""
                });

                setProfilePhoto(response.data.profilePhoto
                    ? `http://localhost:8080/api/student/photo/${encodeURIComponent(response.data.profilePhoto)}`
                    : null);
                setProfileError("");
            } catch (error) {
                console.error(
                    "Error getting student profile:",
                    error.response?.data || error.message
                );
                setProfileError("Your profile information could not be loaded. Refresh to try again.");
            } finally {
                setLoading(false);
            }
        };

        getStudentProfile();
    }, []);

    useEffect(() => {
        let active = true;
        const loadJobs = async () => {
            try {
                const token = localStorage.getItem("token");
                const result = await axios.get("http://localhost:8080/api/jobs/allJobs", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (active) setJobs(Array.isArray(result.data) ? result.data : []);
            } catch (error) {
                console.error("Error getting placement jobs:", error.response?.data || error.message);
                if (active) setJobsError("Job listings are unavailable right now.");
            } finally {
                if (active) setJobsLoading(false);
            }
        };
        loadJobs();
        return () => { active = false; };
    }, []);

    useEffect(() => {
        if (!student.id) return;
        let active = true;
        const loadApplications = async () => {
            setApplicationsLoading(true);
            setApplicationsError("");
            try {
                const token = localStorage.getItem("token");
                const result = await axios.get(
                    `http://localhost:8080/api/applications/student/${student.id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (active) setApplications(Array.isArray(result.data) ? result.data : []);
            } catch (error) {
                console.error("Error getting student applications:", error.response?.data || error.message);
                if (active) setApplicationsError("Application insights are unavailable right now.");
            } finally {
                if (active) setApplicationsLoading(false);
            }
        };
        loadApplications();
        return () => { active = false; };
    }, [student.id]);

    const applicationStatus = (application) => (application.status || "APPLIED").toUpperCase();
    const totalApplications = applications.length;
    const responseCount = applications.filter((application) => applicationStatus(application) !== "APPLIED").length;
    const shortlistedCount = applications.filter((application) => applicationStatus(application) === "SHORTLISTED").length;
    const pendingCount = applications.filter((application) => applicationStatus(application) === "APPLIED").length;
    const rejectedCount = applications.filter((application) => applicationStatus(application) === "REJECTED").length;
    const responseRate = totalApplications ? Math.round((responseCount / totalApplications) * 100) : 0;
    const now = new Date();
    const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 18 ? "Good afternoon" : "Good evening";
    const currentDate = now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const activeJobs = jobs.filter((job) => jobIsOpen(job, todayStart));
    const availableJobsCount = activeJobs.filter((job) => assessJobEligibility(job, student) !== "not-eligible").length;
    const appliedJobIds = new Set(applications.map((application) => String(application.jobId || application.job?.id || "")));
    const recommendedJobs = activeJobs
        .filter((job) => !appliedJobIds.has(String(job.id)) && assessJobEligibility(job, student) !== "not-eligible")
        .sort((first, second) => getSkillMatch(second, student) - getSkillMatch(first, student)
            || new Date(second.createdAt || 0).getTime() - new Date(first.createdAt || 0).getTime())
        .slice(0, 3);
    const upcomingDriveJobs = activeJobs
        .filter((job) => job.deadline && new Date(`${job.deadline}T23:59:59`) >= todayStart)
        .sort((first, second) => new Date(first.deadline).getTime() - new Date(second.deadline).getTime())
        .slice(0, 3);
    const deadlineUpdates = applicationsLoading || applicationsError ? [] : activeJobs.filter((job) => {
        if (!job.deadline || appliedJobIds.has(String(job.id))) return false;
        const deadline = new Date(`${job.deadline}T23:59:59`);
        const daysUntilDeadline = (deadline.getTime() - todayStart.getTime()) / 86400000;
        return daysUntilDeadline >= 0 && daysUntilDeadline <= 7;
    }).map((job) => ({ id: `deadline-${job.id}`, type: "deadline", title: "Application deadline coming up", detail: `${job.title} · ${job.company}`, date: job.deadline }));
    const newJobUpdates = activeJobs.filter((job) => {
        if (!job.createdAt) return false;
        const postedAt = new Date(job.createdAt);
        const ageInDays = (now.getTime() - postedAt.getTime()) / 86400000;
        return !Number.isNaN(postedAt.getTime()) && ageInDays >= 0 && ageInDays <= 7;
    }).map((job) => ({ id: `job-${job.id}`, type: "job", title: "New role posted", detail: `${job.title} · ${job.company}`, date: job.createdAt }));
    const shortlistUpdates = (applicationsLoading || applicationsError ? [] : applications).filter((application) => applicationStatus(application) === "SHORTLISTED")
        .map((application) => ({ id: `shortlist-${application.id}`, type: "shortlist", title: "You have been shortlisted", detail: `${application.job?.title || application.jobTitle || "Application"} · ${application.job?.company || application.company || "Company"}`, date: null }));
    const placementUpdates = [...deadlineUpdates, ...newJobUpdates, ...shortlistUpdates]
        .sort((first, second) => new Date(second.date || 0).getTime() - new Date(first.date || 0).getTime())
        .slice(0, 4);
    const recentApplications = [...applications].sort((first, second) =>
        new Date(second.appliedAt || 0).getTime() - new Date(first.appliedAt || 0).getTime()
    ).slice(0, 4);
    const profileFields = [student.name, student.email, student.rollNo, student.phone, student.branch, student.cgpa, student.skills, student.resume];
    const profileCompletion = Math.round((profileFields.filter(Boolean).length / profileFields.length) * 100);

    const handleProfilePhoto = async (event) => {
        const input = event.currentTarget;
        const file = input.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setPhotoMessage("Choose an image file to update your photo.");
            setPhotoMessageType("error");
            input.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setPhotoMessage("Your photo must be smaller than 5 MB.");
            setPhotoMessageType("error");
            input.value = "";
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
            setPhotoMessage("Please sign in again before uploading a photo.");
            setPhotoMessageType("error");
            input.value = "";
            return;
        }

        const previousPhoto = student.profilePhoto
            ? `http://localhost:8080/api/student/photo/${encodeURIComponent(student.profilePhoto)}`
            : null;
        const previewUrl = URL.createObjectURL(file);
        setPhotoMessage("");
        setPhotoMessageType("success");
        setPhotoUploading(true);
        setProfilePhoto(previewUrl);

        const uploadData = new FormData();
        uploadData.append("photo", file);

        try {
            const response = await axios.post(
                "http://localhost:8080/api/student/photo",
                uploadData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const filename = response.data?.profilePhoto;

            if (!filename) throw new Error("The server did not return the saved photo.");
            setProfilePhoto(`http://localhost:8080/api/student/photo/${encodeURIComponent(filename)}`);
            setStudent(prev => ({ ...prev, profilePhoto: filename }));
            setPhotoMessage("Profile photo updated.");
            setPhotoMessageType("success");
        } catch (error) {
            console.error(
                "Photo upload error:",
                error.response?.data || error.message
            );

            setProfilePhoto(previousPhoto);
            setPhotoMessage(error.response?.data?.message || "Photo upload failed. Please try again.");
            setPhotoMessageType("error");
        } finally {
            URL.revokeObjectURL(previewUrl);
            setPhotoUploading(false);
            input.value = "";
        }
    };

    const handleResume = async (event) => {
        const file = event.target.files[0];

        if (!file) return;

        if (
            file.type !== "application/pdf" &&
            !file.name.toLowerCase().endsWith(".pdf")
        ) {
            alert("Please select a PDF resume.");
            event.target.value = "";
            return;
        }

        const uploadData = new FormData();
        uploadData.append("resume", file);

        try {
            const token = localStorage.getItem("token");

            if (!token) return;

            const response = await axios.post(
                "http://localhost:8080/api/student/resume",
                uploadData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const filename = response.data?.resume;

            if (!filename) {
                alert("Resume uploaded, but the filename was not returned.");
                return;
            }

            setStudent(prev => ({
                ...prev,
                resume: filename
            }));

            setResponse(null);
            setAnalyzerError("");
        } catch (error) {
            console.error(
                "Resume upload error:",
                error.response?.data || error.message
            );

            alert("Resume upload failed. Please try again.");
        } finally {
            event.target.value = "";
        }
    };

    const viewResume = async () => {
        const filename = student.resume;

        if (!filename) return;

        const token = localStorage.getItem("token");

        if (!token) return;

        try {
            const response = await axios.get(
                `http://localhost:8080/api/student/resume/${encodeURIComponent(
                    filename
                )}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    responseType: "blob"
                }
            );

            const pdfUrl = URL.createObjectURL(response.data);
            window.open(pdfUrl, "_blank", "noopener,noreferrer");

            // Revoke the temporary URL after a delay.
            setTimeout(() => URL.revokeObjectURL(pdfUrl), 60000);
        } catch (error) {
            console.error(
                "Error opening resume:",
                error.response?.data || error.message
            );
        }
    };

    const resumeAnalyser = async () => {
        const token = localStorage.getItem("token");

        if (!token) {
            setAnalyzerError("Please log in again.");
            return;
        }

        if (!student.resume) {
            setAnalyzerError("Please upload your resume first.");
            return;
        }

        if (!jobDescription.trim()) {
            setAnalyzerError("Please enter a job description.");
            return;
        }

        setAnalyzing(true);
        setAnalyzerError("");
        setResponse(null);

        try {
            const analyzerData = new FormData();

            analyzerData.append("resume", student.resume);
            analyzerData.append("jobDescription", jobDescription.trim());

            const result = await axios.post(
                "http://localhost:8080/api/resume-analyzer/analyze",
                analyzerData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setResponse(result.data);
        } catch (error) {
            console.error(
                "Resume analysis error:",
                error.response?.data || error.message
            );

            const message = error.response?.data?.message;

            setAnalyzerError(
                typeof message === "string"
                    ? message
                    : typeof error.response?.data === "string"
                    ? error.response.data
                    : error.response?.status === 404
                    ? "Resume PDF not found on the server. Check the backend resume upload path."
                    : error.response?.status === 401 ||
                      error.response?.status === 403
                    ? "You are not authorized. Please log in again."
                    : "Unable to analyze your resume. Check the backend and Ollama logs."
            );
        } finally {
            setAnalyzing(false);
        }
    };

    const openEdit = () => {
        setProfileFormError("");
        setFormData({
            rollNo: student.rollNo || "",
            phone: student.phone || "",
            branch: student.branch || "",
            cgpa: student.cgpa || "",
            skills: student.skills || ""
        });

        setShowEdit(true);
    };

    const closeEdit = () => {
        setShowEdit(false);
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const saveDetails = async () => {
        const missingFields = [
            ["Roll number", formData.rollNo],
            ["Phone", formData.phone],
            ["Branch", formData.branch],
            ["CGPA", formData.cgpa],
            ["Skills", formData.skills]
        ].filter(([, value]) => !String(value || "").trim());

        if (missingFields.length) {
            setProfileFormError(`Please complete: ${missingFields.map(([label]) => label).join(", ")}.`);
            return;
        }

        setProfileFormError("");
        const token = localStorage.getItem("token");

        if (!token) return;

        try {
            const result = await axios.post(
                "http://localhost:8080/api/student/profile",
                {
                    rollNo: formData.rollNo,
                    phone: formData.phone,
                    branch: formData.branch,
                    cgpa: formData.cgpa,
                    skills: formData.skills
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setStudent(prev => ({
                ...prev,
                ...result.data,
                profilePhoto:
                    result.data.profilePhoto ?? prev.profilePhoto,
                resume: result.data.resume ?? prev.resume
            }));

            setFormData({
                rollNo: result.data.rollNo || "",
                phone: result.data.phone || "",
                branch: result.data.branch || "",
                cgpa: result.data.cgpa || "",
                skills: result.data.skills || ""
            });

            const savedPhoto =
                result.data.profilePhoto || student.profilePhoto;

            if (savedPhoto) {
                setProfilePhoto(
                    `http://localhost:8080/api/student/photo/${encodeURIComponent(
                        savedPhoto
                    )}`
                );
            }

            setShowEdit(false);
        } catch (error) {
            console.error(
                "Error saving profile:",
                error.response?.data || error.message
            );
        }
    };

    const closeResumeAnalyzer = () => {
        if (analyzing) return;

        setShowResumeAnalyzer(false);
        setJobDescription("");
        setResponse(null);
        setAnalyzerError("");
    };

    const logout = () => {
        localStorage.removeItem("token");
        window.location.href = "/";
    };

    if (loading) {
        return (
            <div className="loading">
                Loading student profile...
            </div>
        );
    }

    return (
        <>
            <Headers />

            <main className="student-dashboard">
            {profileError && <div className="dashboard-alert" role="alert"><span>{profileError}</span><button onClick={() => window.location.reload()}>Refresh</button></div>}
            <section className="student-overview" aria-labelledby="student-overview-title">
                <div className="overview-heading">
                    <div>
                        <span className="overview-eyebrow"><Sparkles size={14} /> {currentDate.toUpperCase()}</span>
                        <h1 id="student-overview-title">{greeting}, {student.name || "Student"}</h1>
                        <p>Here's your placement overview. See what needs your attention next.</p>
                    </div>
                    <div className="overview-actions">
                        <button className={`overview-button profile-icon-button${profileCompletion < 100 ? " needs-profile" : ""}`} type="button" onClick={openEdit} aria-label={profileCompletion < 100 ? "Complete your profile" : "Edit your profile"} title={profileCompletion < 100 ? "Complete your profile" : "Edit your profile"}><UserRound size={18}/>{profileCompletion < 100 && <i aria-hidden="true"/>}</button>
                        <button className="overview-button secondary" onClick={() => navigate("/application")}>My applications <ArrowRight size={16} /></button>
                        <button className="overview-button primary" onClick={() => navigate("/viewjobs")}>Explore jobs <BriefcaseBusiness size={16} /></button>
                    </div>
                </div>

                <div className="overview-metrics" aria-label="Application summary">
                    <article className="overview-metric metric-profile"><span className="metric-icon"><FileText size={18} /></span><span className="metric-label">Profile completion</span><strong>{profileCompletion}%</strong><small>Keep your details current</small><span className="metric-mini-progress"><span style={{ width: `${profileCompletion}%` }} /></span></article>
                    <article className="overview-metric metric-jobs"><span className="metric-icon"><BriefcaseBusiness size={18} /></span><span className="metric-label">Available jobs</span><strong>{jobsLoading || jobsError ? "—" : availableJobsCount}</strong><small>Active opportunities</small></article>
                    <article className="overview-metric metric-applications"><span className="metric-icon"><Send size={18} /></span><span className="metric-label">Applications</span><strong>{applicationsLoading || applicationsError ? "—" : totalApplications}</strong><small>Submitted by you</small></article>
                    <article className="overview-metric metric-shortlisted"><span className="metric-icon"><CheckCircle2 size={18} /></span><span className="metric-label">Shortlisted</span><strong>{applicationsLoading || applicationsError ? "—" : shortlistedCount}</strong><small>Recruiter interest</small></article>
                </div>

                <div className="overview-panels">
                    <section className="overview-panel response-panel" aria-labelledby="response-title">
                        <div className="panel-heading"><div><span className="panel-kicker">APPLICATION ANALYSIS</span><h2 id="response-title">Response snapshot</h2></div><span className="panel-icon"><TrendingUp size={18} /></span></div>
                        {applicationsError ? <p className="overview-empty-state" role="status">{applicationsError}</p> : applicationsLoading ? <p className="overview-empty-state">Loading your application activity...</p> : totalApplications === 0 ? <div className="overview-empty-state"><p>Your application story starts with one good match.</p><button onClick={() => navigate("/viewjobs")}>Browse open roles <ArrowRight size={15} /></button></div> : <>
                            <div className="response-rate-row"><strong>{responseRate}%</strong><span>of your applications have received an update</span></div>
                            <div className="response-progress" role="progressbar" aria-label="Applications with recruiter responses" aria-valuenow={responseRate} aria-valuemin="0" aria-valuemax="100"><span style={{ width: `${responseRate}%` }} /></div>
                            <div className="status-breakdown">
                                <div><span className="status-dot pending-dot" /> <span>Applied</span><strong>{pendingCount}</strong></div>
                                <div><span className="status-dot shortlisted-dot" /> <span>Shortlisted</span><strong>{shortlistedCount}</strong></div>
                                <div><span className="status-dot rejected-dot" /> <span>Rejected</span><strong>{rejectedCount}</strong></div>
                            </div>
                        </>}
                    </section>

                    <section className="overview-panel recent-applications-panel" aria-labelledby="recent-applications-title">
                        <div className="panel-heading"><div><span className="panel-kicker">STAY IN THE LOOP</span><h2 id="recent-applications-title">Recent applications</h2></div><button className="text-link" onClick={() => navigate("/application")}>View all <ArrowRight size={15} /></button></div>
                        {applicationsError ? <p className="overview-empty-state">Could not load recent applications.</p> : applicationsLoading ? <p className="overview-empty-state">Loading recent applications...</p> : recentApplications.length === 0 ? <div className="overview-empty-state"><p>No applications yet. Explore roles that match your skills.</p><button onClick={() => navigate("/viewjobs")}>Find a role <ArrowRight size={15} /></button></div> : <div className="recent-application-list">
                            {recentApplications.map((application) => {
                                const status = applicationStatus(application);
                                const title = application.job?.title || application.jobTitle || "Job application";
                                const company = application.job?.company || application.company || "Company";
                                const appliedDate = application.appliedAt ? new Date(application.appliedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "Date unavailable";
                                return <button className="recent-application" key={application.id} onClick={() => navigate("/application")}>
                                    <span className="application-mark"><BriefcaseBusiness size={17} /></span>
                                    <span className="recent-application-copy"><strong>{title}</strong><small>{company} · Applied {appliedDate}</small></span>
                                    <span className={`application-status status-${status.toLowerCase()}`}>{status.replaceAll("_", " ")}</span>
                                </button>;
                            })}
                        </div>}
                    </section>

                    <section className="overview-panel readiness-panel" aria-labelledby="readiness-title">
                        <div className="panel-heading"><div><span className="panel-kicker">READY FOR OPPORTUNITIES</span><h2 id="readiness-title">Resume &amp; skills</h2></div><span className="panel-icon"><FileText size={18} /></span></div>
                        <div className="readiness-score"><strong>{profileCompletion}%</strong><span>profile complete</span></div>
                        <div className="readiness-progress" role="progressbar" aria-label="Profile completeness" aria-valuenow={profileCompletion} aria-valuemin="0" aria-valuemax="100"><span style={{ width: `${profileCompletion}%` }} /></div>
                        <div className="readiness-checks"><p className={student.resume ? "is-complete" : ""}><CheckCircle2 size={15} /> Resume {student.resume ? "uploaded" : "not uploaded"}</p><p className={student.skills ? "is-complete" : ""}><CheckCircle2 size={15} /> Skills {student.skills ? "added" : "not added"}</p></div>
                        {student.resume && <p className="resume-file-summary"><FileText size={14} /> {student.resume} <small>Update date unavailable</small></p>}
                        {student.skills && <div className="skill-chip-list">{student.skills.split(",").map((skill) => skill.trim()).filter(Boolean).slice(0, 5).map((skill) => <span key={skill}>{skill}</span>)}</div>}
                        <div className="readiness-actions">
                            <label className="readiness-upload">{student.resume ? "Replace resume" : "Upload resume"}<input type="file" accept=".pdf,application/pdf" onChange={handleResume} /></label>
                            <button className="readiness-edit" onClick={openEdit}>Edit profile <ArrowRight size={15} /></button>
                            <button className="readiness-edit" disabled={!student.resume} onClick={() => { setResponse(null); setAnalyzerError(""); setShowResumeAnalyzer(true); }}>Resume analyzer <ArrowRight size={15} /></button>
                        </div>
                    </section>
                </div>

                <div className="student-content-grid">
                    <section className="overview-panel recommended-jobs-panel" aria-labelledby="recommended-jobs-title">
                        <div className="panel-heading"><div><span className="panel-kicker">MATCH YOUR NEXT MOVE</span><h2 id="recommended-jobs-title">Recommended jobs</h2></div><button className="text-link" onClick={() => navigate("/viewjobs")}>Browse all <ArrowRight size={15} /></button></div>
                        {jobsError ? <p className="overview-empty-state" role="status">{jobsError}</p> : applicationsError ? <p className="overview-empty-state" role="status">Recommendations are paused because your application list could not be checked.</p> : jobsLoading || applicationsLoading ? <p className="overview-empty-state">Checking your applications and matching active roles...</p> : recommendedJobs.length === 0 ? <div className="overview-empty-state"><p>No new matching roles right now. We’ll show active opportunities here as they become available.</p><button onClick={() => navigate("/viewjobs")}>Browse jobs <ArrowRight size={15} /></button></div> : <div className="recommended-job-list">
                            {recommendedJobs.map((job) => {
                                const eligibility = assessJobEligibility(job, student);
                                const skills = (job.skills || "").split(",").map((skill) => skill.trim()).filter(Boolean).slice(0, 4);
                                const skillMatch = Math.round(getSkillMatch(job, student) * 100);
                                return <article className="recommended-job-card" key={job.id}>
                                    <div className="recommended-job-top"><span className="job-company-mark">{(job.company || "?").trim().slice(0, 1).toUpperCase()}</span><span className={`eligibility-chip ${eligibility === "not-eligible" ? "not-eligible" : eligibility === "check" ? "review" : ""}`}>{eligibility === "eligible" ? "Criteria matched" : "Review eligibility"}</span></div>
                                    <h3>{job.title || "Role"}</h3><p className="recommended-company">{job.company || "Company"}</p>
                                    <div className="recommended-job-meta"><span>{job.jobType || "Job type not listed"}</span><span>{job.location || "Location not listed"}</span></div>
                                    {skills.length > 0 && <div className="skill-chip-list">{skills.map((skill) => <span key={skill}>{skill}</span>)}</div>}
                                    {skills.length > 0 && <p className="skill-match-copy">{student.skills ? `${skillMatch}% of listed skills match your profile` : "Add skills to your profile to see your match"}</p>}
                                    <p className="eligibility-copy"><strong>Eligibility:</strong> {job.eligibility || "No specific criteria listed; review the job details."}</p>
                                    <div className="recommended-job-footer"><small>{job.deadline ? `Apply by ${new Date(`${job.deadline}T00:00:00`).toLocaleDateString()}` : "No deadline listed"}</small><button onClick={() => navigate(`/jobs/${job.id}`)}>View job <ArrowRight size={14} /></button></div>
                                </article>;
                            })}
                        </div>}
                    </section>

                    <section className="overview-panel drives-panel" aria-labelledby="drives-title">
                        <div className="panel-heading"><div><span className="panel-kicker">DATES TO KEEP IN MIND</span><h2 id="drives-title">Upcoming placement drives</h2></div><span className="panel-icon"><CalendarDays size={18} /></span></div>
                        <p className="panel-description">Upcoming active roles and their application deadlines.</p>
                        {jobsError ? <p className="overview-empty-state">Drive information is unavailable right now.</p> : jobsLoading ? <p className="overview-empty-state">Loading upcoming opportunities...</p> : upcomingDriveJobs.length === 0 ? <p className="overview-empty-state">No upcoming placement drives listed.</p> : <div className="drive-list">
                            {upcomingDriveJobs.map((job) => <article className="drive-item" key={job.id}>
                                <span className="drive-date"><strong>{new Date(`${job.deadline}T00:00:00`).toLocaleDateString(undefined, { day: "2-digit" })}</strong><small>{new Date(`${job.deadline}T00:00:00`).toLocaleDateString(undefined, { month: "short" })}</small></span>
                                <div className="drive-copy"><strong>{job.company || "Company"}</strong><span>{job.title || "Open role"}</span><small>Apply by {new Date(`${job.deadline}T00:00:00`).toLocaleDateString()} · Drive date not listed</small><small>Eligibility: {job.eligibility || "Not listed"}</small></div>
                                <button aria-label={`View ${job.title || "job"} details`} onClick={() => navigate(`/jobs/${job.id}`)}><ArrowRight size={16} /></button>
                            </article>)}
                        </div>}
                    </section>
                </div>

                <div className="student-content-grid lower-content-grid">
                    <section className="overview-panel interviews-panel" aria-labelledby="interviews-title">
                        <div className="panel-heading"><div><span className="panel-kicker">PREPARE WITH CONFIDENCE</span><h2 id="interviews-title">Upcoming interviews</h2></div><span className="panel-icon"><CalendarDays size={18} /></span></div>
                        <div className="section-empty-state"><span className="empty-state-icon"><CalendarDays size={21} /></span><strong>Interview schedules aren’t available here yet.</strong><p>Scheduled interviews will appear here once the portal supports interview scheduling.</p></div>
                    </section>

                    <section className="overview-panel updates-panel" aria-labelledby="updates-title">
                        <div className="panel-heading"><div><span className="panel-kicker">WHAT’S NEW</span><h2 id="updates-title">Placement updates</h2></div><span className="panel-icon"><Bell size={18} /></span></div>
                        {applicationsLoading || jobsLoading ? <p className="overview-empty-state">Checking for placement updates...</p> : placementUpdates.length === 0 && (applicationsError || jobsError) ? <p className="overview-empty-state" role="status">Placement updates could not be checked completely. Refresh to try again.</p> : placementUpdates.length === 0 ? <div className="section-empty-state compact"><span className="empty-state-icon"><Bell size={20} /></span><strong>No new placement updates.</strong><p>New roles, deadline reminders, and application decisions will show here.</p></div> : <div className="updates-list">
                            {placementUpdates.map((update) => <article className="update-item" key={update.id}><span className={`update-icon update-${update.type}`}>{update.type === "deadline" ? <Clock3 size={15} /> : update.type === "shortlist" ? <CheckCircle2 size={15} /> : <BriefcaseBusiness size={15} />}</span><div><strong>{update.title}</strong><p>{update.detail}</p><small>{update.date ? new Date(update.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "Current status"}</small></div></article>)}
                        </div>}
                        <div className="announcement-empty"><Bell size={14} /><span>No placement cell announcements are published through this portal.</span></div>
                    </section>
                </div>
            </section>

            <div className="profile-card">
                <div className="profile-header">
                    <div className="photo-container">
                        <div className="student-photo-frame">
                            {profilePhoto ? <img
                                key={profilePhoto}
                                src={profilePhoto}
                                alt={`${student.name || "Student"} profile`}
                                className="student-photo"
                                onError={() => setProfilePhoto(null)}
                            /> : <span className="student-photo-fallback" aria-label="No profile photo uploaded">
                                {(student.name || "S").trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}
                            </span>}
                            {photoUploading && <span className="photo-uploading" role="status">Uploading...</span>}
                        </div>

                        <label className={`change-photo${photoUploading ? " is-uploading" : ""}`}>
                            {photoUploading ? "Uploading photo..." : profilePhoto ? "Change photo" : "Add a profile photo"}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleProfilePhoto}
                                className="photo-file-input"
                                aria-label="Choose a new profile photo"
                                disabled={photoUploading}
                            />
                        </label>
                        <span className="photo-hint">JPG, PNG or WEBP · up to 5 MB</span>
                    </div>

                    <div className="student-welcome">
                        <span className="profile-eyebrow">STUDENT DASHBOARD</span>
                        <h2>Welcome, {student.name} 👋</h2>
                        <p>Your placement journey, all in one place.</p>
                        {photoMessage && <p className={`photo-message${photoMessageType === "error" ? " is-error" : ""}`} role={photoMessageType === "error" ? "alert" : "status"}>{photoMessage}</p>}
                    </div>
                </div>

                <div className="profile-details">
                    <p><strong>Name:</strong> {student.name || "Not available"}</p>
                    <p><strong>Roll No:</strong> {student.rollNo || "Not added"}</p>
                    <p><strong>Email:</strong> {student.email || "Not available"}</p>
                    <p><strong>Phone:</strong> {student.phone || "Not added"}</p>
                    <p><strong>Branch:</strong> {student.branch || "Not added"}</p>
                    <p><strong>CGPA:</strong> {student.cgpa || "Not added"}</p>
                    <p><strong>Skills:</strong> {student.skills || "Not added"}</p>
                </div>

                <div className="resume-section">
                    <h3>Resume</h3>

                    {student.resume ? (
                        <p className="resume-name">
                            📄 {student.resume} ✅
                        </p>
                    ) : (
                        <p className="no-resume">
                            Resume not uploaded ❌
                        </p>
                    )}

                    <div className="resume-buttons">
                        <label className="upload-btn">
                            📤 {student.resume ? "Replace Resume" : "Upload Resume"}
                            <input
                                type="file"
                                accept=".pdf,application/pdf"
                                onChange={handleResume}
                                hidden
                            />
                        </label>

                        {student.resume && (
                            <button
                                type="button"
                                className="view-resume-btn"
                                onClick={viewResume}
                            >
                                👁 View Resume
                            </button>
                        )}
                    </div>
                </div>

                <div className="profile-buttons">
                    <button className="edit-btn" onClick={openEdit}>
                        ✏️ Edit Details
                    </button>

                    <button
                        className="resume-analyser-btn"
                        onClick={() => {
                            setResponse(null);
                            setAnalyzerError("");
                            setShowResumeAnalyzer(true);
                        }}
                    >
                        ⬆️ Resume Analyser
                    </button>
                </div>
            </div>

            <div className="placement-section">
                <h2>Placement</h2>

                <div className="placement-buttons">
                    <button
                        className="placement-btn jobs-btn"
                        onClick={() => navigate("/viewjobs")}
                    >
                        <span>💼</span>
                        <strong>VIEW JOBS</strong>
                        <small>Find available jobs</small>
                    </button>

                    <button
                        className="placement-btn application-btn"
                        onClick={() => navigate("/application")}
                    >
                        <span>📋</span>
                        <strong>APPLICATIONS</strong>
                        <small>Track your applications</small>
                    </button>
                </div>
            </div>

            </main>

            {showEdit && (
                <div className="popup-overlay">
                    <div className="edit-popup">
                        <div className="popup-header">
                            <div className="edit-profile-heading">
                                <span>{profileCompletion < 100 ? "PROFILE SETUP" : "PROFILE SETTINGS"}</span>
                                <h2>{profileCompletion < 100 ? "Complete your profile" : "Edit your details"}</h2>
                                <p>{profileCompletion < 100 ? "Add your academic details and skills to get relevant placement opportunities." : "Keep your academic profile current for better job matches."}</p>
                            </div>
                            <button
                                type="button"
                                className="close-btn"
                                aria-label="Close edit profile"
                                onClick={closeEdit}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="edit-form">
                            {profileFormError && <p className="profile-form-error" role="alert">{profileFormError}</p>}
                            <div className="form-group">
                                <label htmlFor="edit-student-name">Name <small>Managed by portal</small></label>
                                <input
                                    id="edit-student-name"
                                    type="text"
                                    value={student.name || ""}
                                    disabled
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="edit-roll-number">Roll No</label>
                                <input
                                    id="edit-roll-number"
                                    type="text"
                                    name="rollNo"
                                    value={formData.rollNo}
                                    required
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="edit-student-email">Email <small>Managed by portal</small></label>
                                <input
                                    id="edit-student-email"
                                    type="email"
                                    value={student.email || ""}
                                    disabled
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="edit-student-phone">Phone</label>
                                <input
                                    id="edit-student-phone"
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    required
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="edit-student-branch">Branch</label>
                                <input
                                    id="edit-student-branch"
                                    type="text"
                                    name="branch"
                                    value={formData.branch}
                                    required
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="edit-student-cgpa">CGPA</label>
                                <input
                                    id="edit-student-cgpa"
                                    type="number"
                                    step="0.01"
                                    name="cgpa"
                                    value={formData.cgpa}
                                    required
                                    min="0"
                                    max="10"
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group full-width">
                                <label htmlFor="edit-student-skills">Skills <small>Separate skills with commas</small></label>
                                <input
                                    id="edit-student-skills"
                                    type="text"
                                    name="skills"
                                    value={formData.skills}
                                    required
                                    onChange={handleChange}
                                    placeholder="Java, Python, React, SQL"
                                />
                            </div>
                            {!student.resume && <p className="profile-resume-reminder">A PDF resume is also needed for a complete placement profile. Upload it from the Resume &amp; Skills panel.</p>}
                        </div>

                        <div className="popup-footer">
                            <button type="button" className="cancel-btn" onClick={closeEdit}>
                                Cancel
                            </button>

                            <button type="button" className="save-btn" onClick={saveDetails}>
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showResumeAnalyzer && (
                <div className="popup-overlay">
                    <div className="edit-popup resume-analyzer-popup">
                        <div className="popup-header">
                            <h2>🤖 AI Resume Analyzer</h2>

                            <button
                                type="button"
                                className="close-btn"
                                onClick={closeResumeAnalyzer}
                                disabled={analyzing}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="edit-form">
                            <div className="form-group full-width">
                                <label>Your Resume</label>

                                {student.resume ? (
                                    <p>📄 {student.resume} ✅</p>
                                ) : (
                                    <p>
                                        No resume uploaded. Please upload
                                        your resume from the dashboard first.
                                    </p>
                                )}
                            </div>

                            <div className="form-group full-width">
                                <label htmlFor="jobDescription">
                                    Job Description
                                </label>

                                <textarea
                                    id="jobDescription"
                                    value={jobDescription}
                                    onChange={(event) =>
                                        setJobDescription(event.target.value)
                                    }
                                    placeholder="Paste the job description here..."
                                    rows={6}
                                    required
                                    disabled={analyzing}
                                />
                            </div>
                        </div>

                        {analyzerError && (
                            <p className="analyzer-error" role="alert">
                                {analyzerError}
                            </p>
                        )}

                        {analyzing && (
                            <p className="analyzer-loading">
                                🤖 Analyzing your resume... Please wait.
                            </p>
                        )}

                        {response?.analysis && (
                            <div className="resume-analysis-result">
                                <h3>📊 Resume Analysis Result</h3>
                                <pre>{response.analysis}</pre>
                            </div>
                        )}

                        <div className="popup-footer">
                            <button
                                type="button"
                                className="cancel-btn"
                                onClick={closeResumeAnalyzer}
                                disabled={analyzing}
                            >
                                Close
                            </button>

                            <button
                                type="button"
                                className="resume-analyser-btn"
                                disabled={
                                    analyzing ||
                                    !student.resume ||
                                    !jobDescription.trim()
                                }
                                onClick={resumeAnalyser}
                            >
                                {analyzing
                                    ? "Analyzing..."
                                    : "✨ Analyze Resume"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default StudentDashboard;
