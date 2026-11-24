
import './ViewApplicants.css';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { SlidersHorizontal, Search, Users, UserCheck, Clock3 } from "lucide-react";
import RecruiterPipelineBoard from "./RecruiterPipelineBoard.jsx";
import CandidateComparisonPanel from "./CandidateComparisonPanel.jsx";
import { scheduleInterviewInvite } from "./interviewScheduling.js";

const BASE_URL = "http://localhost:8080";

export function ViewApplicants() {

    const navigate = useNavigate();

    const [applications, setApplications] = useState([]);
    const [selectedApplicant, setSelectedApplicant] = useState(null);

    const [showFilter, setShowFilter] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState("ALL");
    const [appliedFilter, setAppliedFilter] = useState("ALL");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [rankJobId, setRankJobId] = useState("");
    const [rankedMatches, setRankedMatches] = useState([]);
    const [matchDetail, setMatchDetail] = useState(null);
    const [matchesLoading, setMatchesLoading] = useState(false);
    const [viewMode, setViewMode] = useState("LIST");
    const [comparisonIds, setComparisonIds] = useState([]);
    const [comparisonOpen, setComparisonOpen] = useState(false);
    const recruiterJobs = [...new Map(applications.filter((app) => app.job).map((app) => [app.job.id, app.job])).values()];
    const selectedApplications = comparisonIds.map((id) => applications.find((app) => app.id === id)).filter(Boolean);
    const comparisonJobId = selectedApplications[0]?.job?.id;

    const toggleComparisonCandidate = (application) => {
        if (comparisonIds.includes(application.id)) {
            setComparisonIds((prev) => prev.filter((id) => id !== application.id));
            return;
        }
        if (comparisonIds.length >= 5) { toast.info("Compare up to five applicants at a time."); return; }
        if (selectedApplications.length && String(selectedApplications[0].job?.id) !== String(application.job?.id)) {
            toast.info("Select applicants for the same job to compare them."); return;
        }
        setComparisonIds((prev) => [...prev, application.id]);
    };

    const removeComparisonCandidate = (id) => {
        const next = comparisonIds.filter((candidateId) => candidateId !== id);
        setComparisonIds(next);
        if (next.length < 2) setComparisonOpen(false);
    };

    useEffect(() => {
        if (!rankJobId) { setRankedMatches([]); return; }
        let active = true;
        setMatchesLoading(true);
        axios.get(`${BASE_URL}/api/recruiter/jobs/${rankJobId}/candidate-matches`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } })
            .then((response) => { if (active) setRankedMatches(response.data || []); })
            .catch((error) => { console.error(error); if (active) toast.error("Unable to load candidate match ranking"); })
            .finally(() => { if (active) setMatchesLoading(false); });
        return () => { active = false; };
    }, [rankJobId]);

    const matchByApplication = new Map(rankedMatches.map((match, index) => [match.applicationId, { ...match, rank: index + 1 }]));

    useEffect(() => {

        const getApplicants = async () => {
            try {
                const token = localStorage.getItem("token");

                const response = await axios.get(
                    `${BASE_URL}/api/applications/recruiter/applicants`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                setApplications(response.data);

            } catch (error) {
                console.error(error);
                toast.error("Unable to load applicants");
            } finally {
                setLoading(false);
            }
        };

        getApplicants();

    }, []);

    // View student resume
    const viewResume = async (application) => {

        const filename = application.student.resume;

        if (!filename) {
            toast.error("No resume uploaded.");
            return;
        }

        const token = localStorage.getItem("token");

        if (!token) {
            toast.error("Please login again.");
            return false;
        }

        try {

            const response = await axios.get(
                `${BASE_URL}/api/student/resume/${encodeURIComponent(filename)}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    responseType: "blob"
                }
            );

            const pdfUrl = URL.createObjectURL(response.data);

            window.open(pdfUrl, "_blank");

        } catch (error) {
            console.error("Error opening resume:", error);
            toast.error("Unable to view resume.");
        }
    };

    // Send status notification email
    const sendStatusEmail = async (application, status) => {

        const student = application.student;

        const isShortlisted = status === "SHORTLISTED";

        const subject = isShortlisted
            ? `Congratulations! You have been shortlisted for ${application.job.title}`
            : `Application Status Update - ${application.job.title}`;

        const body = isShortlisted
            ? `Dear ${student.name},

Congratulations!

We are pleased to inform you that you have been shortlisted for the following position.

Job Title: ${application.job.title}
Company: ${application.job.company}
Application Status: SHORTLISTED

Our recruitment team will contact you with further details regarding the next steps.

Best wishes,
Recruitment Team`
            : `Dear ${student.name},

Thank you for applying for the following position.

Job Title: ${application.job.title}
Company: ${application.job.company}
Application Status: REJECTED

We appreciate your interest and the time you invested in the application process.

We encourage you to apply for other opportunities that match your profile.

Best wishes,
Recruitment Team`;

        await axios.post(
            `${BASE_URL}/api/email/send`,
            {
                to: student.email,
                subject: subject,
                body: body
            },
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json"
                }
            }
        );
    };

    // Update application status and send email
    const updateApplicationStatus = async (application, status) => {

        const token = localStorage.getItem("token");

        if (!token) {
            toast.error("Please login again.");
            return false;
        }

        const isShortlisted = status === "SHORTLISTED";

        const endpoint = isShortlisted
            ? `/api/applications/shortlist/${application.id}`
            : `/api/applications/rejected/${application.id}`;

        try {

            // Step 1: Update application status
            await axios.put(
                `${BASE_URL}${endpoint}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            // Step 2: Update frontend immediately
            setApplications((prevApplications) =>
                prevApplications.map((app) =>
                    app.id === application.id
                        ? {
                            ...app,
                            status: status
                        }
                        : app
                )
            );

            // Keep a comparison panel open with the latest persisted status.

            // Step 3: Send email notification
            try {

                await sendStatusEmail(application, status);

                toast.success(
                    isShortlisted
                        ? "Applicant shortlisted and email sent!"
                        : "Applicant rejected and email sent!"
                );

            } catch (emailError) {

                console.error("Email sending failed:", emailError);

                toast.warning(
                    `Status updated, but email could not be sent to ${application.student.email}`
                );

            }

            return true;

        } catch (error) {

            console.error("Error updating application status:", error);

            toast.error(
                isShortlisted
                    ? "Unable to shortlist applicant"
                    : "Unable to reject applicant"
            );
            return false;

        }
    };

    // Shortlist applicant
    const shortlist = (application) => {
        return updateApplicationStatus(application, "SHORTLISTED");
    };

    // Reject applicant
    const reject = (application) => {
        return updateApplicationStatus(application, "REJECTED");
    };

    const updatePipelineStage = (applicationId, status) => setApplications((prev) => prev.map((app) => app.id === applicationId ? { ...app, status } : app));

    const changeCandidateStage = async (application, stage) => {
        try {
            if (stage === "INTERVIEW_SCHEDULED") {
                const sent = await scheduleInterviewInvite(application.id, application.student?.name);
                if (!sent) return false;
            } else {
                await axios.put(`${BASE_URL}/api/recruiter/pipeline/applications/${application.id}/stage`,
                    { stage, reopen: false, note: null },
                    { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
            }
            updatePipelineStage(application.id, stage);
            toast.success(stage === "INTERVIEW_SCHEDULED"
                ? `Interview invitation emailed to ${application.student?.name || "the applicant"}.`
                : `${application.student?.name || "Applicant"} moved to ${stage.replaceAll("_", " ").toLowerCase()}.`);
            return true;
        } catch (error) {
            console.error("Unable to update recruitment stage:", error);
            toast.error(error.response?.data?.message || error.message || `Unable to move applicant to ${stage.replaceAll("_", " ").toLowerCase()}.`);
            return false;
        }
    };

    const viewApplicantProfile = async (application) => {
        const current = String(application.status || "APPLIED").toUpperCase();
        if (current === "APPLIED") {
            const moved = await changeCandidateStage(application, "UNDER_REVIEW");
            if (moved) application = { ...application, status: "UNDER_REVIEW" };
        }
        setSelectedApplicant(application);
    };

    // Filter applications
    const filteredApplications = applications.filter((application) => {

        const matchesStatus = appliedFilter === "ALL" || application.status === appliedFilter;
        const needle = search.trim().toLowerCase();
        const matchesSearch = !needle || [application.student?.name, application.student?.email, application.job?.title, application.job?.company]
            .some((value) => String(value || "").toLowerCase().includes(needle));
        return matchesStatus && matchesSearch && (!rankJobId || String(application.job?.id) === String(rankJobId));

    });

    const displayedApplications = rankJobId
        ? [...filteredApplications].sort((a, b) => (matchByApplication.get(a.id)?.rank ?? Number.MAX_SAFE_INTEGER) - (matchByApplication.get(b.id)?.rank ?? Number.MAX_SAFE_INTEGER))
        : filteredApplications;

    const applyFilter = () => {
        setAppliedFilter(selectedStatus);
        setShowFilter(false);
    };

    return (

        <div className="view-applicants-page">

            <div className="button-part">

                <button
                    onClick={() => navigate('/recruiterDashboard')}
                    className="back-button"
                >
                    ← Back To Profile
                </button>

                <button
                    className="filter-button"
                    onClick={() => {
                        setSelectedStatus(appliedFilter);
                        setShowFilter(true);
                    }}
                >
                    <SlidersHorizontal size={20} />
                </button>

            </div>

            {/* Filter Popup */}
            {showFilter && (

                <div
                    className="filter-popup-overlay"
                    onClick={() => setShowFilter(false)}
                >

                    <div
                        className="filter-popup"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <button
                            className="filter-popup-close"
                            onClick={() => setShowFilter(false)}
                        >
                            ×
                        </button>

                        <h2>Filter Applicants</h2>

                        <div className="filter-option">

                            <label>
                                <input type="radio" name="status" checked={selectedStatus === "APPLIED"} onChange={() => setSelectedStatus("APPLIED")} />
                                Applied
                            </label>

                            <label>
                                <input
                                    type="radio"
                                    name="status"
                                    checked={selectedStatus === "ALL"}
                                    onChange={() => setSelectedStatus("ALL")}
                                />
                                All
                            </label>

                            <label>
                                <input
                                    type="radio"
                                    name="status"
                                checked={selectedStatus === "UNDER_REVIEW"}
                                onChange={() => setSelectedStatus("UNDER_REVIEW")}
                                />
                                Under review
                            </label>

                            <label>
                                <input
                                    type="radio"
                                    name="status"
                                    checked={selectedStatus === "SHORTLISTED"}
                                    onChange={() => setSelectedStatus("SHORTLISTED")}
                                />
                                Shortlisted
                            </label>

                            <label>
                                <input
                                    type="radio"
                                    name="status"
                                    checked={selectedStatus === "INTERVIEW_SCHEDULED"}
                                    onChange={() => setSelectedStatus("INTERVIEW_SCHEDULED")}
                                />
                                Interview scheduled
                            </label>

                            <label>
                                <input
                                    type="radio"
                                    name="status"
                                    checked={selectedStatus === "INTERVIEWED"}
                                    onChange={() => setSelectedStatus("INTERVIEWED")}
                                />
                                Interview completed
                            </label>

                            <label>
                                <input
                                    type="radio"
                                    name="status"
                                    checked={selectedStatus === "REJECTED"}
                                    onChange={() => setSelectedStatus("REJECTED")}
                                />
                                Rejected
                            </label>

                        </div>

                        <button
                            className="apply-filter-button"
                            onClick={applyFilter}
                        >
                            Apply Filter
                        </button>

                    </div>

                </div>

            )}

            {/* Header */}
            <div className="view-applicants-header">

                <h1>Applicants</h1>

                <p>
                    View and manage applicants for your jobs
                </p>

            </div>

            <section className="applicant-summary" aria-label="Applicant summary">
                <article><span className="summary-icon"><Users size={18}/></span><div><small>Total applicants</small><strong>{applications.length}</strong></div></article>
                <article><span className="summary-icon"><Clock3 size={18}/></span><div><small>Awaiting review</small><strong>{applications.filter((app) => app.status === "APPLIED").length}</strong></div></article>
                <article><span className="summary-icon"><UserCheck size={18}/></span><div><small>Shortlisted</small><strong>{applications.filter((app) => app.status === "SHORTLISTED").length}</strong></div></article>
            </section>
            <div className="applicants-tools">
                <label className="applicant-search"><Search size={17}/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by candidate, role, or company" aria-label="Search applicants"/></label>
                <span className="applicant-result-count">{filteredApplications.length} {filteredApplications.length === 1 ? "candidate" : "candidates"}</span>
            </div>

            <div className="applicant-view-toggle" role="group" aria-label="Applicant view">
                <button className={viewMode === "LIST" ? "active" : ""} onClick={() => setViewMode("LIST")}>Applicant list</button>
                <button className={viewMode === "PIPELINE" ? "active" : ""} onClick={() => setViewMode("PIPELINE")}>Pipeline board</button>
            </div>

            {viewMode === "LIST" && comparisonIds.length > 0 && <section className="comparison-selection-bar" aria-label="Candidates selected for comparison">
                <div><strong>{comparisonIds.length} of 5 selected</strong><span>{comparisonIds.length < 2 ? "Select one more applicant" : `Same job: ${selectedApplications[0]?.job?.title || "Selected role"}`}</span></div>
                <div className="comparison-selection-actions">
                    <button onClick={() => setComparisonIds([])}>Clear selection</button>
                    <button className="compare-open-button" disabled={comparisonIds.length < 2 || comparisonIds.length > 5} onClick={() => setComparisonOpen(true)}>Compare candidates</button>
                </div>
            </section>}

            {viewMode === "PIPELINE" ? <RecruiterPipelineBoard /> : <>
            <div className="match-ranking-tools">
                <label htmlFor="rank-job">Candidate match ranking</label>
                <select id="rank-job" value={rankJobId} onChange={(event) => setRankJobId(event.target.value)}>
                    <option value="">Choose a job to view ranked applicants</option>
                    {recruiterJobs.map((job) => <option key={job.id} value={job.id}>{job.title} · {job.company}</option>)}
                </select>
                {matchesLoading && <span>Calculating matches…</span>}
            </div>

            {/* Applicant Cards */}
            <div className="view-applicants-container">

                {loading ? <div className="applicants-empty">Loading applicants…</div> : displayedApplications.map((application) => (

                    <div
                        className="view-applicant-card"
                        key={application.id}
                    >

                        <div className="view-applicant-header">

                            <label className="compare-candidate-check" onClick={(event) => event.stopPropagation()}>
                                <input type="checkbox" checked={comparisonIds.includes(application.id)} disabled={!comparisonIds.includes(application.id) && (comparisonIds.length >= 5 || (selectedApplications.length > 0 && String(selectedApplications[0].job?.id) !== String(application.job?.id)))} title={selectedApplications.length > 0 && String(selectedApplications[0].job?.id) !== String(application.job?.id) ? "Compare applicants for the same job only" : comparisonIds.length >= 5 ? "Up to five candidates can be compared" : ""} onChange={() => toggleComparisonCandidate(application)} aria-label={`Select ${application.student?.name || "applicant"} for comparison`} />
                                Compare
                            </label>

                            <div>

                                <h2>
                                    {application.student.name}
                                </h2>

                                <p>
                                    {application.student.email}
                                </p>

                            </div>

                            <span>
                                {application.status}
                            </span>

                        </div>

                        <div className="view-job-info">

                            <h3>Applied For</h3>

                            <p>
                                Job: {application.job.title}
                            </p>

                            <p>
                                Company: {application.job.company}
                            </p>

                        </div>

                        {matchByApplication.has(application.id) && (() => {
                            const match = matchByApplication.get(application.id);
                            const label = !match.matchScoreAvailable ? "Score unavailable" : match.matchScore >= 85 ? "Excellent match" : match.matchScore >= 70 ? "Good match" : match.matchScore >= 50 ? "Partial match" : "Low match";
                            return <section className="candidate-match-card">
                                <button className="candidate-match-score" onClick={async () => {
                                    try {
                                        const response = await axios.get(`${BASE_URL}/api/recruiter/jobs/${rankJobId}/candidate-matches/${application.id}`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
                                        setMatchDetail(response.data);
                                    } catch (error) { console.error(error); toast.error("Unable to load match details"); }
                                }}><strong>{match.matchScoreAvailable ? `${match.matchScore}%` : "N/A"}</strong><span>{label} · #{match.rank}</span></button>
                                <span className={`candidate-eligibility ${match.eligibilityStatus?.toLowerCase()}`}>{match.eligibilityStatus?.replaceAll("_", " ")}</span>
                                <div><small>Matched skills</small><p>{match.matchedSkills?.length ? match.matchedSkills.join(", ") : "None recorded"}</p></div>
                                <div><small>Missing skills</small><p>{match.missingSkills?.length ? match.missingSkills.join(", ") : "None"}</p></div>
                            </section>;
                        })()}

                        <div className="view-student-details">

                            <p>
                                Branch: {application.student.branch}
                            </p>

                            <p>
                                CGPA: {application.student.cgpa}
                            </p>

                            <p>
                                Phone: {application.student.phone}
                            </p>

                            <p>
                                Skills: {application.student.skills}
                            </p>

                            <p>
                                Applied On: {
                                new Date(
                                    application.appliedAt
                                ).toLocaleDateString(
                                    "en-GB",
                                    {
                                        day: "2-digit",
                                        month: "long",
                                        year: "numeric"
                                    }
                                )
                            }
                            </p>

                        </div>

                        <div className="view-applicant-actions">

                            <button
                                onClick={() => viewApplicantProfile(application)}
                            >
                                View Profile
                            </button>

                            <button
                                onClick={() => viewResume(application)}
                            >
                                View Resume
                            </button>

                            <button
                                onClick={() => shortlist(application)}
                                disabled={
                                    application.status === "SHORTLISTED" ||
                                    application.status === "REJECTED" ||
                                    application.status === "SELECTED"
                                }
                            >
                                {
                                    application.status === "SHORTLISTED"
                                        ? "Shortlisted"
                                        : "Shortlist"
                                }
                            </button>

                            <button
                                onClick={() => {
                                    if (window.confirm(`Reject ${application.student?.name || "this applicant"} for ${application.job?.title || "this role"}?`)) reject(application);
                                }}
                                disabled={
                                    application.status === "REJECTED" ||
                                    application.status === "SELECTED"
                                }
                            >
                                {
                                    application.status === "REJECTED"
                                        ? "Rejected"
                                        : "Reject"
                                }
                            </button>

                            <button
                                className="schedule-interview-action"
                                onClick={() => changeCandidateStage(application, "INTERVIEW_SCHEDULED")}
                                disabled={String(application.status).toUpperCase() !== "SHORTLISTED"}
                            >
                                {application.status === "INTERVIEW_SCHEDULED" ? "Interview scheduled" : "Schedule interview"}
                            </button>

                            <button
                                className="complete-interview-action"
                                onClick={() => changeCandidateStage(application, "INTERVIEWED")}
                                disabled={String(application.status).toUpperCase() !== "INTERVIEW_SCHEDULED"}
                            >
                                {application.status === "INTERVIEWED" ? "Interview completed" : "Mark interview completed"}
                            </button>

                            <button
                                className="select-candidate-action"
                                onClick={() => changeCandidateStage(application, "SELECTED")}
                                disabled={String(application.status).toUpperCase() !== "INTERVIEWED"}
                            >
                                {application.status === "SELECTED" ? "Selected" : "Select candidate"}
                            </button>

                        </div>

                    </div>

                ))}

            </div>
            </>}

            {viewMode === "LIST" && matchDetail && <div className="profile-popup-overlay" onClick={() => setMatchDetail(null)}><section className="candidate-match-modal" onClick={(event) => event.stopPropagation()}>
                <button className="profile-popup-close" onClick={() => setMatchDetail(null)}>×</button>
                <h2>Candidate match analysis</h2><p>{matchDetail.studentName} · {matchDetail.matchScoreAvailable ? `${matchDetail.matchScore}% match` : "Score unavailable"}</p>
                <p><strong>Eligibility:</strong> {matchDetail.eligibilityStatus?.replaceAll("_", " ")}</p>
                <p><strong>Score breakdown:</strong> Skills {matchDetail.skillMatchScore ?? "N/A"}% · Branch {matchDetail.branchMatchScore ?? "N/A"}% · CGPA {matchDetail.cgpaMatchScore ?? "N/A"}%</p>
                <p>{matchDetail.scoreExplanation}</p>
                <p><strong>Matched skills:</strong> {matchDetail.matchedSkills?.join(", ") || "None recorded"}</p><p><strong>Missing skills:</strong> {matchDetail.missingSkills?.join(", ") || "None"}</p>
                <p><strong>Branch:</strong> {matchDetail.branchMatchStatus} · <strong>CGPA:</strong> {matchDetail.cgpaMatchStatus}</p>
                <p><strong>Strengths:</strong> {matchDetail.strengths?.join(" ") || "No specific strengths available from recorded criteria."}</p><p><strong>Areas to improve:</strong> {matchDetail.areasToImprove?.join(" ") || "No specific gaps identified."}</p>
                <ul>{matchDetail.eligibilityReasons?.map((reason) => <li key={reason}>{reason}</li>)}</ul>
            </section></div>}

            {viewMode === "LIST" && !loading && filteredApplications.length === 0 && (

                <div className="applicants-empty">

                    <span className="summary-icon"><Users size={20}/></span>
                    <h2>No applicants found</h2>
                    <p>Try changing your search or status filter.</p>

                </div>

            )}

            {/* Student Profile Popup */}
            {viewMode === "LIST" && selectedApplicant && (

                <div
                    className="profile-popup-overlay"
                onClick={() => setSelectedApplicant(null)}
                >

                    <div
                        className="profile-popup"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <button
                            className="profile-popup-close"
                            onClick={() => setSelectedApplicant(null)}
                        >
                            ×
                        </button>

                        {selectedApplicant.student.profilePhoto ? (

                            <img
                                className="profile-popup-photo"
                                src={`${BASE_URL}/api/student/photo/${encodeURIComponent(
                                    selectedApplicant.student.profilePhoto
                                )}`}
                                alt={selectedApplicant.student.name}
                            />

                        ) : (

                            <div className="profile-popup-no-photo">
                                No Photo
                            </div>

                        )}

                        <h2>Student Profile</h2>

                        <div className="profile-popup-details">

                            <p>
                                <strong>Name:</strong>{" "}
                                {selectedApplicant.student.name}
                            </p>

                            <p>
                                <strong>Email:</strong>{" "}
                                {selectedApplicant.student.email}
                            </p>

                            <p>
                                <strong>Phone:</strong>{" "}
                                {selectedApplicant.student.phone}
                            </p>

                            <p>
                                <strong>Branch:</strong>{" "}
                                {selectedApplicant.student.branch}
                            </p>

                            <p>
                                <strong>CGPA:</strong>{" "}
                                {selectedApplicant.student.cgpa}
                            </p>

                            <p>
                                <strong>Skills:</strong>{" "}
                                {selectedApplicant.student.skills}
                            </p>

                            <p>
                                <strong>Applied On:</strong>{" "}
                                {new Date(
                                    selectedApplicant.appliedAt
                                ).toLocaleDateString("en-GB")}
                            </p>

                        </div>

                        <button
                            className="close-profile-button"
                            onClick={() => setSelectedApplicant(null)}
                        >
                            Close
                        </button>

                    </div>

                </div>

            )}

            {comparisonOpen && <CandidateComparisonPanel
                jobId={comparisonJobId}
                applicationIds={comparisonIds}
                applications={applications}
                onClose={() => setComparisonOpen(false)}
                onRemove={removeComparisonCandidate}
                onViewProfile={(application) => { setComparisonOpen(false); viewApplicantProfile(application); }}
                onShortlist={shortlist}
                onReject={reject}
                onStageUpdate={updatePipelineStage}
            />}

            <ToastContainer />

        </div>

    );
}
