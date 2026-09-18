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

        // When search is empty,
        // show all shortlisted candidates
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

        try {

            const data = await searchShortlisted(value.trim());

            // Replace old profiles with search results
            setShortData(data || []);

        } catch (error) {

            console.log(error);

            // Don't show old profiles
            setShortData([]);

        }
    };


    // Only display profiles where both
    // student and job actually exist
    const validProfiles = shortData.filter(
        (data) =>
            data.student &&
            data.job
    );


    return (
        <div className="shortlisted-page">


            {/* Header */}
            <div className="shortlisted-header">

                <div>

                    <button
                        className="back-btn"
                        onClick={() => {
                            navigate("/recruiterDashboard");
                        }}
                    >
                        ← Back to Dashboard
                    </button>

                    <h1>Shortlisted Candidates</h1>

                    <p>
                        Manage shortlisted students and schedule interviews
                    </p>

                </div>

            </div>


            {/* Stats */}
            <div className="shortlisted-stats">

                <div className="stat-card">

                    <span>👥</span>

                    <h2>
                        {shortlisted}
                    </h2>

                    <p>
                        Shortlisted
                    </p>

                </div>


                <div className="stat-card">

                    <span>📅</span>

                    <h2>
                        8
                    </h2>

                    <p>
                        Scheduled
                    </p>

                </div>


                <div className="stat-card">

                    <span>🔗</span>

                    <h2>
                        4
                    </h2>

                    <p>
                        Link Sent
                    </p>

                </div>

            </div>


            {/* Search and Filters */}
            <div className="filters">

                <input
                    type="text"
                    placeholder="🔍 Search candidate..."
                    value={search}
                    onChange={(e) => {
                        handleSearch(e.target.value);
                    }}
                />


                <select>

                    <option>
                        All Jobs
                    </option>

                    {shortData.map((data) => {

                        if (!data.job) {
                            return null;
                        }

                        return (
                            <option
                                key={data.id}
                                value={data.job.id}
                            >
                                {data.job.title}
                            </option>
                        );

                    })}

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

                    <option>
                        Scheduled
                    </option>

                    <option>
                        Link Sent
                    </option>

                </select>

            </div>


            {/* Candidate List */}
            <div className="candidate-list">


                {/* No profiles */}
                {validProfiles.length === 0 ? (

                    <div className="no-profiles">

                        <h2>
                            No profiles found
                        </h2>

                        {search.trim() !== "" && (
                            <p>
                                No shortlisted candidate matches "{search}"
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


                        return (

                            <div
                                className="candidate-card"
                                key={data.id}
                            >


                                {/* Candidate Top */}
                                <div className="candidate-top">

                                    <div className="candidate-info">

                                        <div className="candidate-avatar">
                                            VR
                                        </div>

                                        <div>

                                            <h2>
                                                {data.student.name}
                                            </h2>

                                            <span className="status">
                                                ● SHORTLISTED
                                            </span>

                                        </div>

                                    </div>

                                </div>


                                {/* Candidate Details */}
                                <div className="candidate-details">


                                    <div>

                                        <span>
                                            Email
                                        </span>

                                        <p>
                                            {data.student.email}
                                        </p>

                                    </div>


                                    <div>

                                        <span>
                                            Phone
                                        </span>

                                        <p>
                                            {data.student.phone}
                                        </p>

                                    </div>


                                    <div>

                                        <span>
                                            Branch
                                        </span>

                                        <p>
                                            {data.student.branch}
                                        </p>

                                    </div>


                                    <div>

                                        <span>
                                            CGPA
                                        </span>

                                        <p>
                                            {data.student.cgpa}
                                        </p>

                                    </div>


                                </div>


                                {/* Job Information */}
                                <div className="job-info">


                                    <p>

                                        <strong>
                                            Job:
                                        </strong>{" "}

                                        {data.job.title}

                                    </p>


                                    <p>

                                        <strong>
                                            Applied:
                                        </strong>{" "}

                                        {data.appliedAt
                                            ? new Date(
                                                data.appliedAt
                                            ).toLocaleDateString(
                                                "en-GB",
                                                {
                                                    day: "2-digit",
                                                    month: "long",
                                                    year: "numeric"
                                                }
                                            )
                                            : ""}

                                    </p>


                                    <p>

                                        <strong>
                                            Skills:
                                        </strong>{" "}

                                        {skills}

                                    </p>


                                </div>


                                {/* Interview Section */}
                                <div className="interview-section">

                                    <h3>
                                        🎯 Interview
                                    </h3>


                                    <div className="interview-form">


                                        <div>

                                            <label>
                                                Interview Date
                                            </label>

                                            <input
                                                type="date"
                                            />

                                        </div>


                                        <div>

                                            <label>
                                                Interview Time
                                            </label>

                                            <input
                                                type="time"
                                            />

                                        </div>


                                    </div>


                                    <div className="link-input">

                                        <label>
                                            Interview Link
                                        </label>

                                        <input
                                            type="text"
                                            placeholder="https://meet.google.com/..."
                                        />

                                    </div>


                                </div>


                                {/* Actions */}
                                <div className="candidate-actions">


                                    {/* View Resume */}
                                    <button
                                        className="resume-btn"
                                        onClick={() =>
                                            viewResume(
                                                data.student.resume
                                            )
                                        }
                                    >
                                        📄 View Resume
                                    </button>


                                    {/* View Profile */}
                                    <button
                                        className="profile-btn"
                                        onClick={() => {
                                            setSelectedApplicant(data);
                                        }}
                                    >
                                        👁 View Profile
                                    </button>


                                    {/* Schedule Interview */}
                                    <button className="schedule-btn">
                                        📅 Schedule Interview
                                    </button>


                                    {/* Send Interview Link */}
                                    <button className="send-btn">
                                        🔗 Send Interview Link
                                    </button>


                                </div>


                            </div>

                        );

                    })

                )}

            </div>


            {/* Profile Popup */}
            {selectedApplicant && (
                <ViewProfile
                    selectedApplicant={selectedApplicant}
                    setSelectedApplicant={setSelectedApplicant}
                />
            )}


        </div>
    );
}

export default Shortlisted;