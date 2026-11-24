
import './ViewApplicants.css';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { SlidersHorizontal, Search, Users, UserCheck, Clock3 } from "lucide-react";

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
            return;
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
            return;
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

        } catch (error) {

            console.error("Error updating application status:", error);

            toast.error(
                isShortlisted
                    ? "Unable to shortlist applicant"
                    : "Unable to reject applicant"
            );

        }
    };

    // Shortlist applicant
    const shortlist = (application) => {
        updateApplicationStatus(application, "SHORTLISTED");
    };

    // Reject applicant
    const reject = (application) => {
        updateApplicationStatus(application, "REJECTED");
    };

    // Filter applications
    const filteredApplications = applications.filter((application) => {

        const matchesStatus = appliedFilter === "ALL" || application.status === appliedFilter;
        const needle = search.trim().toLowerCase();
        const matchesSearch = !needle || [application.student?.name, application.student?.email, application.job?.title, application.job?.company]
            .some((value) => String(value || "").toLowerCase().includes(needle));
        return matchesStatus && matchesSearch;

    });

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
                                    checked={selectedStatus === "SHORTLISTED"}
                                    onChange={() => setSelectedStatus("SHORTLISTED")}
                                />
                                Shortlisted
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

            {/* Applicant Cards */}
            <div className="view-applicants-container">

                {loading ? <div className="applicants-empty">Loading applicants…</div> : filteredApplications.map((application) => (

                    <div
                        className="view-applicant-card"
                        key={application.id}
                    >

                        <div className="view-applicant-header">

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
                                onClick={() => setSelectedApplicant(application)}
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
                                    application.status === "REJECTED"
                                }
                            >
                                {
                                    application.status === "SHORTLISTED"
                                        ? "Shortlisted"
                                        : "Shortlist"
                                }
                            </button>

                            <button
                                onClick={() => reject(application)}
                                disabled={
                                    application.status === "REJECTED" ||
                                    application.status === "SHORTLISTED"
                                }
                            >
                                {
                                    application.status === "REJECTED"
                                        ? "Rejected"
                                        : "Reject"
                                }
                            </button>

                        </div>

                    </div>

                ))}

            </div>

            {!loading && filteredApplications.length === 0 && (

                <div className="applicants-empty">

                    <span className="summary-icon"><Users size={20}/></span>
                    <h2>No applicants found</h2>
                    <p>Try changing your search or status filter.</p>

                </div>

            )}

            {/* Student Profile Popup */}
            {selectedApplicant && (

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

            <ToastContainer />

        </div>

    );
}
