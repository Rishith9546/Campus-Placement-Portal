import "./shortlisted.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
    countShortlisted,
    getShortlisted,
    searchShortlisted
} from "./API/shortlistedApi.js";
import axios from "axios";
import { ViewProfile } from "./ViewProfile.jsx";

function Shortlisted() {

    const [shortlisted, setShortlisted] = useState(0);
    const [shortData, setShortData] = useState([]);
    const [selectedApplicant, setSelectedApplicant] = useState(null);

    const [search, setSearch] = useState("");
    const [jobId, setJobId] = useState("");

    const navigate = useNavigate();

    // View Resume
    const viewResume = async (filename) => {

        if (!filename) {
            console.log("Resume not available");
            return;
        }

        const token = localStorage.getItem("token");

        if (!token) {
            console.log("Token not found");
            return;
        }

        try {

            const response = await axios.get(
                `http://localhost:8080/api/student/resume/${encodeURIComponent(filename)}`,
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
        }
    };

    // Get shortlisted count
    useEffect(() => {

        const getCount = async () => {

            try {
                const data = await countShortlisted();
                setShortlisted(data);
            } catch (error) {
                console.log(error);
            }

        };

        getCount();

    }, []);

    // Get shortlisted candidates
    useEffect(() => {

        const getData = async () => {

            try {

                const data = await getShortlisted();
                setShortData(data || []);

            } catch (error) {

                console.log(error);
                setShortData([]);

            }

        };

        getData();

    }, []);

    // Search candidates
    const handleSearch = async (value) => {

        setSearch(value);

        if (value.trim() === "") {

            try {

                const data = await getShortlisted();
                setShortData(data || []);

            } catch (error) {

                console.log(error);
                setShortData([]);

            }

            return;
        }

        if (!jobId) {
            console.log("Please select a job first");
            return;
        }

        try {

            const data = await searchShortlisted(
                jobId,
                value.trim()
            );

            setShortData(data || []);

        } catch (error) {

            console.log(error);
            setShortData([]);

        }
    };

    // Get unique jobs
    const uniqueJobs = [];

    shortData.forEach((data) => {

        if (!data.job) {
            return;
        }

        const exists = uniqueJobs.some(
            (job) => job.id === data.job.id
        );

        if (!exists) {
            uniqueJobs.push(data.job);
        }

    });

    // Job selection
    const handleJobChange = async (e) => {

        const selectedJobId = e.target.value;

        setJobId(selectedJobId);

        if (selectedJobId === "") {

            try {

                const data = await getShortlisted();
                setShortData(data || []);

            } catch (error) {

                console.log(error);
                setShortData([]);

            }

            return;
        }

        if (search.trim() !== "") {

            try {

                const data = await searchShortlisted(
                    selectedJobId,
                    search.trim()
                );

                setShortData(data || []);

            } catch (error) {

                console.log(error);
                setShortData([]);

            }
        }
    };

    // Only display valid profiles
    const validProfiles = shortData.filter(
        (data) =>
            data.student &&
            data.job
    );

    return (

        <div className="shortlisted-page">

            {/* Header */}
            <div className="shortlisted-header">

                <button
                    className="back-btn"
                    onClick={() => navigate("/recruiterDashboard")}
                >
                    ← Back to Dashboard
                </button>

                <div className="header-content">

                    <div>
                        <div className="page-label">
                            RECRUITER
                        </div>

                        <h1>
                            Shortlisted Candidates
                        </h1>

                        <p>
                            Review and manage students shortlisted for your jobs.
                        </p>
                    </div>

                    <div className="header-count">

                        <span>
                            Shortlisted
                        </span>

                        <strong>
                            {shortlisted}
                        </strong>

                    </div>

                </div>

            </div>


            {/* Main Content */}
            <div className="shortlisted-container">

                {/* Filters */}
                <div className="filter-card">

                    <div className="filter-title">

                        <div>
                            <h3>Candidate Search</h3>
                            <p>
                                Find shortlisted candidates quickly
                            </p>
                        </div>

                    </div>

                    <div className="filters">

                        <div className="search-box">

                            <span>⌕</span>

                            <input
                                type="text"
                                placeholder="Search by candidate name..."
                                value={search}
                                onChange={(e) =>
                                    handleSearch(e.target.value)
                                }
                            />

                        </div>

                        <select
                            value={jobId}
                            onChange={handleJobChange}
                        >

                            <option value="">
                                All Jobs
                            </option>

                            {uniqueJobs.map((job) => (

                                <option
                                    key={job.id}
                                    value={job.id}
                                >
                                    {job.title}
                                </option>

                            ))}

                        </select>

                        <select>

                            <option>
                                All Branches
                            </option>

                            <option>
                                CSE
                            </option>

                            <option>
                                ECE
                            </option>

                            <option>
                                EE
                            </option>

                        </select>

                        <select>

                            <option>
                                All Status
                            </option>

                            <option>
                                Shortlisted
                            </option>

                        </select>

                    </div>

                </div>


                {/* Candidate Heading */}
                <div className="candidate-heading">

                    <div>

                        <h2>
                            Shortlisted Students
                        </h2>

                        <p>
                            {validProfiles.length} candidate
                            {validProfiles.length !== 1 ? "s" : ""} found
                        </p>

                    </div>

                </div>


                {/* Candidate List */}
                <div className="candidate-list">

                    {validProfiles.length === 0 ? (

                        <div className="no-profiles">

                            <div className="empty-icon">
                                👤
                            </div>

                            <h2>
                                No shortlisted candidates
                            </h2>

                            {search.trim() !== "" ? (

                                <p>
                                    No shortlisted candidate matches
                                    "{search}"
                                </p>

                            ) : (

                                <p>
                                    There are no shortlisted candidates
                                    available.
                                </p>

                            )}

                        </div>

                    ) : (

                        validProfiles.map((data) => {

                            const skills = data.job.skills
                                ? data.job.skills
                                    .split(",")
                                    .join(" • ")
                                : "";

                            const name = data.student.name || "Student";

                            const initials = name
                                .split(" ")
                                .map((word) => word.charAt(0))
                                .join("")
                                .slice(0, 2)
                                .toUpperCase();

                            return (

                                <div
                                    className="candidate-card"
                                    key={data.id}
                                >

                                    {/* Candidate Header */}
                                    <div className="candidate-top">

                                        <div className="candidate-info">

                                            <div className="candidate-avatar">
                                                {initials}
                                            </div>

                                            <div className="candidate-name">

                                                <h2>
                                                    {data.student.name}
                                                </h2>

                                                <span className="status">
                                                    <span className="status-dot">
                                                        ●
                                                    </span>

                                                    Shortlisted
                                                </span>

                                            </div>

                                        </div>

                                        <div className="candidate-id">
                                            Application #{data.id}
                                        </div>

                                    </div>


                                    {/* Candidate Information */}
                                    <div className="candidate-details">

                                        <div className="detail-item">

                                            <span>
                                                EMAIL
                                            </span>

                                            <p>
                                                {data.student.email}
                                            </p>

                                        </div>

                                        <div className="detail-item">

                                            <span>
                                                PHONE
                                            </span>

                                            <p>
                                                {data.student.phone || "Not provided"}
                                            </p>

                                        </div>

                                        <div className="detail-item">

                                            <span>
                                                BRANCH
                                            </span>

                                            <p>
                                                {data.student.branch}
                                            </p>

                                        </div>

                                        <div className="detail-item">

                                            <span>
                                                CGPA
                                            </span>

                                            <p className="cgpa">
                                                {data.student.cgpa}
                                            </p>

                                        </div>

                                    </div>


                                    {/* Job Information */}
                                    <div className="job-section">

                                        <div className="job-title">

                                            <span className="job-icon">
                                                💼
                                            </span>

                                            <div>

                                                <span>
                                                    APPLIED FOR
                                                </span>

                                                <h3>
                                                    {data.job.title}
                                                </h3>

                                            </div>

                                        </div>

                                        <div className="job-meta">

                                            <div>

                                                <span>
                                                    Applied On
                                                </span>

                                                <p>
                                                    {data.appliedAt
                                                        ? new Date(
                                                            data.appliedAt
                                                        ).toLocaleDateString(
                                                            "en-GB",
                                                            {
                                                                day: "2-digit",
                                                                month: "short",
                                                                year: "numeric"
                                                            }
                                                        )
                                                        : "N/A"}
                                                </p>

                                            </div>

                                            <div>

                                                <span>
                                                    Skills
                                                </span>

                                                <p>
                                                    {skills || "Not specified"}
                                                </p>

                                            </div>

                                        </div>

                                    </div>


                                    {/* Actions */}
                                    <div className="candidate-actions">

                                        <button
                                            className="resume-btn"
                                            onClick={() =>
                                                viewResume(
                                                    data.student.resume
                                                )
                                            }
                                        >
                                            <span>📄</span>
                                            View Resume
                                        </button>

                                        <button
                                            className="profile-btn"
                                            onClick={() =>
                                                setSelectedApplicant(data)
                                            }
                                        >
                                            <span>👁</span>
                                            View Profile
                                        </button>

                                    </div>

                                </div>

                            );

                        })

                    )}

                </div>

            </div>


            {/* Profile Popup */}
            {selectedApplicant && (

                <ViewProfile
                    selectedApplicant={selectedApplicant}
                    setSelectedApplicant={
                        setSelectedApplicant
                    }
                />

            )}

        </div>

    );
}

export default Shortlisted;