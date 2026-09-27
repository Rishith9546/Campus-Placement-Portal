import "./Application.css";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Headers } from "../Student/Headers.jsx";
import { SlidersHorizontal } from "lucide-react";
import { Filter } from "./Filter.jsx";

export function Application() {

    const navigate = useNavigate();

    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showFilter, setShowFilter] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState("All");


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

    const filteredApplications =
        selectedFilter === "All" || selectedFilter === ""
            ? applications
            : applications.filter(
                (application) =>
                    application.status === selectedFilter.toUpperCase()
            );


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
                        className="filter-button"
                        onClick={() =>
                            setShowFilter(!showFilter)
                        }
                    >
                        <SlidersHorizontal size={20} />
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

                    <h1>
                        My Applications
                    </h1>

                    <p>
                        Track all your job applications
                    </p>

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
                            View Jobs
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