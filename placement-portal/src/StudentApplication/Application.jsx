import "./Application.css";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Headers } from "../Student/Headers.jsx";
import { SlidersHorizontal, Search, Send, Clock3, CheckCircle2, BriefcaseBusiness, ArrowRight, Sparkles } from "lucide-react";
import { Filter } from "./Filter.jsx";

export function Application() {

    const navigate = useNavigate();

    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showFilter, setShowFilter] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState("All");
    const [search, setSearch] = useState("");


    useEffect(() => {

        const fetchApplications = async () => {

            try {

                const token = localStorage.getItem("token");

                const profileResponse = await axios.get(
                    "http://localhost:8080/api/student/profile",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const studentId = profileResponse.data.id;

                const response = await axios.get(
                    `http://localhost:8080/api/applications/student/${studentId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                setApplications(response.data);

            } catch (error) {

                console.log(error);

            } finally {

                setLoading(false);

            }

        };

        fetchApplications();

    }, []);


    const getStatusClass = (status) => {

        if (status === "APPLIED") {
            return "status applied";
        }

        if (status === "SHORTLISTED") {
            return "status shortlisted";
        }

        if (status === "REJECTED") {
            return "status rejected";
        }

        return "status";

    };


    /* =========================
       FILTER APPLICATIONS
    ========================= */

    const filteredApplications = applications.filter((application) => {
        const statusMatches = selectedFilter === "All" || selectedFilter === ""
            || application.status === selectedFilter.toUpperCase();
        const query = search.trim().toLowerCase();
        const title = application.job?.title || application.jobTitle || "Job";
        const company = application.job?.company || application.company || "";
        const matchesQuery = !query || [title, company, application.job?.location, application.jobType]
            .some((value) => String(value || "").toLowerCase().includes(query));
        return statusMatches && matchesQuery;
    });


    if (loading) {

        return (
            <>
                <Headers />

                <div className="applications-page loading-page">

                    <h2>
                        Loading applications...
                    </h2>

                </div>
            </>
        );

    }


    return (
        <>
            <Headers />

            <div className="applications-page">


                {/* =========================
                    TOP ACTIONS
                ========================= */}

                <div className="application-actions">

                    <button
                        className="back-button"
                        onClick={() => navigate("/dashboard")}
                    >
                        ← Back to Dashboard
                    </button>


                    <button
                        type="button"
                        className="filter-button"
                        aria-haspopup="dialog"
                        aria-expanded={showFilter}
                        aria-controls="application-filter-panel"
                        onClick={() =>
                            setShowFilter(!showFilter)
                        }
                    >
                        <SlidersHorizontal size={20} />
                        <span>Filter</span>
                        {selectedFilter !== "All" && <small>1</small>}
                    </button>


                    {/* FILTER POPUP */}

                    {showFilter && (
                        <Filter
                            selectedFilter={selectedFilter}
                            setSelectedFilter={setSelectedFilter}
                            setShowFilter={setShowFilter}
                        />
                    )}

                </div>


                {/* =========================
                    HEADER
                ========================= */}

                <div className="applications-header">
                    <span className="applications-eyebrow"><Sparkles size={14}/> APPLICATION TRACKER</span>
                    <div className="applications-title-row"><div><h1>My Applications</h1><p>Track every opportunity and see where you are in the process.</p></div><span className="application-total"><strong>{applications.length}</strong><small>Total applications</small></span></div>

                </div>

                <section className="application-summary" aria-label="Application status summary">
                    <article><span><Send size={17}/></span><small>Submitted</small><strong>{applications.length}</strong></article>
                    <article><span><Clock3 size={17}/></span><small>Awaiting response</small><strong>{applications.filter((item) => (item.status || "APPLIED").toUpperCase() === "APPLIED").length}</strong></article>
                    <article><span><CheckCircle2 size={17}/></span><small>Shortlisted</small><strong>{applications.filter((item) => (item.status || "").toUpperCase() === "SHORTLISTED").length}</strong></article>
                </section>

                <div className="applications-search-row">
                    <label className="applications-search"><Search size={17}/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by role, company, or location" aria-label="Search applications"/></label>
                    <span>{filteredApplications.length} {filteredApplications.length === 1 ? "application" : "applications"}</span>
                </div>


                {/* =========================
                    APPLICATIONS
                ========================= */}

                {applications.length === 0 ? (

                    <div className="no-applications">

                        <h2>
                            No Applications Yet
                        </h2>

                        <p>
                            You haven't applied for any jobs yet.
                        </p>

                        <button
                            onClick={() =>
                                navigate("/viewjobs")
                            }
                        >
                            Browse jobs <ArrowRight size={15}/>
                        </button>

                    </div>

                ) : filteredApplications.length === 0 ? (

                    <div className="no-applications">

                        <h2>
                            No {selectedFilter} Applications
                        </h2>

                        <p>
                            You don't have any applications with this status.
                        </p>

                    </div>

                ) : (

                    <div className="applications-container">

                        {filteredApplications.map(
                            (application) => (

                                <div
                                    className="application-card"
                                    key={application.id}
                                >


                                    {/* =========================
                                        CARD HEADER
                                    ========================= */}

                                    <div className="application-top">

                                        <div>

                                            <h2>
                                                {application.job?.title ||
                                                    application.jobTitle ||
                                                    "Job"}
                                            </h2>

                                            <p className="company">

                                                {application.job?.company ||
                                                    application.company ||
                                                    ""}

                                            </p>

                                        </div>


                                        <span
                                            className={getStatusClass(
                                                application.status
                                            )}
                                        >
                                            {application.status}
                                        </span>

                                    </div>


                                    {/* =========================
                                        DETAILS
                                    ========================= */}

                                    <div className="application-details">

                                        <p>
                                            <strong>
                                                Location:
                                            </strong>{" "}

                                            {application.job?.location ||
                                                application.location ||
                                                "Not specified"}
                                        </p>


                                        <p>
                                            <strong>
                                                Job Type:
                                            </strong>{" "}

                                            {application.job?.jobType ||
                                                application.jobType ||
                                                "Not specified"}
                                        </p>


                                        <p>
                                            <strong>
                                                Salary:
                                            </strong>{" "}

                                            {application.job?.salary ||
                                                application.salary ||
                                                "Not specified"}
                                        </p>


                                        <p>
                                            <strong>
                                                Applied On:
                                            </strong>{" "}

                                            {application.appliedAt
                                                ? new Date(
                                                    application.appliedAt
                                                ).toLocaleDateString()
                                                : "Not available"}

                                        </p>

                                    </div>


                                    {/* =========================
                                        VIEW JOB
                                    ========================= */}

                                    <button
                                        className="view-job-btn"
                                        onClick={() =>
                                            navigate(
                                                `/jobs/${application.jobId}`
                                            )
                                        }
                                    >
                                        View Job
                                    </button>


                                </div>

                            )
                        )}

                    </div>

                )}

            </div>
        </>
    );
}
