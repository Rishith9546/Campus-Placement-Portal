import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PostJob } from "./PostJob.jsx";
import "./ManageJobs.css";
import axios from "axios";

const ManageJobs = () => {

    const navigate = useNavigate();

    const [postJob, setPostJob] = useState(false);
    const [jobs, setJobs] = useState([]);
    const [applicantCounts, setApplicantCounts] = useState({});
    const [status, setStatus] = useState("All Jobs");
    const [search, setSearch] = useState("");

    // EDIT POPUP
    const [editJob, setEditJob] = useState(null);

    useEffect(() => {

        const getAllJobs = async () => {

            try {

                const token = localStorage.getItem("token");

                const response = await axios.get(
                    "http://localhost:8080/api/jobs/allJobsById",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                setJobs(response.data);

            } catch (error) {

                console.error(
                    "Error fetching recruiter jobs:",
                    error
                );

                setJobs([]);

            }
        };


        const getClosedJobs = async () => {

            try {

                const token = localStorage.getItem("token");

                const response = await axios.get(
                    "http://localhost:8080/api/jobs/allClosedJobs",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                setJobs(response.data);

            } catch (error) {

                console.error(
                    "Error fetching closed jobs:",
                    error
                );

                setJobs([]);

            }
        };


        const getActiveJobs = async () => {

            try {

                const token = localStorage.getItem("token");

                const response = await axios.get(
                    "http://localhost:8080/api/jobs/allActiveJobs",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                setJobs(response.data);

            } catch (error) {

                console.error(
                    "Error fetching active jobs:",
                    error
                );

                setJobs([]);

            }
        };


        if (status === "All Jobs") {

            getAllJobs();

        } else if (status === "Active") {

            getActiveJobs();

        } else {

            getClosedJobs();

        }

    }, [status]);


    // SEARCH
    useEffect(() => {

        const searchJobs = async () => {

            try {

                const token = localStorage.getItem("token");

                const response = await axios.get(
                    `http://localhost:8080/api/jobs/search?keyword=${search}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                setJobs(response.data);

            } catch (error) {

                console.error(
                    "Error searching jobs:",
                    error
                );

                setJobs([]);

            }
        };

        if (search.trim() !== "") {
            searchJobs();
        }

    }, [search]);


    // APPLICANT COUNT
    useEffect(() => {

        if (jobs.length === 0) {

            setApplicantCounts({});

            return;

        }

        const getApplicantCounts = async () => {

            try {

                const token = localStorage.getItem("token");

                const counts = {};

                for (const job of jobs) {

                    const response = await axios.get(
                        `http://localhost:8080/api/applications/countById/${job.id}`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        }
                    );

                    counts[job.id] = response.data;

                }

                setApplicantCounts(counts);

            } catch (error) {

                console.error(
                    "Error fetching applicant counts:",
                    error
                );

            }
        };

        getApplicantCounts();

    }, [jobs]);


    // EDIT JOB
    const handleEditChange = (e) => {

        const { name, value } = e.target;

        setEditJob((previous) => ({
            ...previous,
            [name]: value
        }));

    };


    // UPDATE JOB
    const handleUpdateJob = async () => {

        try {

            const token = localStorage.getItem("token");

            const response = await axios.put(
                `http://localhost:8080/api/jobs/${editJob.id}`,
                editJob,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setJobs((previousJobs) =>
                previousJobs.map((job) =>
                    job.id === editJob.id
                        ? response.data
                        : job
                )
            );

            setEditJob(null);

        } catch (error) {

            console.error(
                "Error updating job:",
                error
            );

            alert("Failed to update job.");

        }

    };


    return (

        <div className="manage-jobs-page">

            {/* BACK */}

            <div className="dashboard-back">

                <button
                    onClick={() =>
                        navigate("/recruiterDashboard")
                    }
                >
                    ← Back to Dashboard
                </button>

            </div>


            {/* HEADER */}

            <div className="manage-header">

                <div>

                    <h1>
                        Manage Jobs
                    </h1>

                    <p>
                        View and manage all your job postings
                    </p>

                </div>


                <button
                    className="create-job-button"
                    onClick={() =>
                        setPostJob(true)
                    }
                >
                    + Post New Job
                </button>


                {postJob && (

                    <PostJob
                        onClose={() =>
                            setPostJob(false)
                        }
                    />

                )}

            </div>


            {/* FILTERS */}

            <div className="job-filters">

                <div className="job-search">

                    <span>
                        🔍
                    </span>

                    <input
                        type="text"
                        placeholder="Search jobs..."
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                    />

                </div>


                <select
                    value={status}
                    onChange={(e) =>
                        setStatus(e.target.value)
                    }
                >

                    <option value="All Jobs">
                        All Jobs
                    </option>

                    <option value="Active">
                        Active
                    </option>

                    <option value="Closed">
                        Closed
                    </option>

                </select>

            </div>


            {/* JOB TABLE */}

            <div className="job-table-wrapper">

                <table className="job-list-table">

                    <thead>

                    <tr>

                        <th>Job</th>

                        <th>Location</th>

                        <th>Type</th>

                        <th>Deadline</th>

                        <th>Applicants</th>

                        <th>Status</th>

                        <th>Actions</th>

                    </tr>

                    </thead>


                    <tbody>

                    {jobs.length === 0 ? (

                        <tr>

                            <td
                                colSpan="7"
                                className="no-jobs"
                            >
                                {status === "All Jobs" &&
                                    "No jobs found."}

                                {status === "Active" &&
                                    "No active jobs found."}

                                {status === "Closed" &&
                                    "No closed jobs found."}
                            </td>

                        </tr>

                    ) : (

                        jobs.map((job) => {

                            const today = new Date();

                            const deadline = job.deadline
                                ? new Date(
                                    job.deadline + "T23:59:59"
                                )
                                : null;

                            const jobStatus =
                                deadline && today <= deadline
                                    ? "Active"
                                    : "Closed";


                            return (

                                <tr key={job.id}>

                                    <td>

                                        <div className="job-details">

                                            <div className="job-avatar">

                                                {job.title
                                                    ? job.title.charAt(0)
                                                    : "J"}

                                            </div>

                                            <div>

                                                <h3>
                                                    {job.title}
                                                </h3>

                                                <p>
                                                    {job.skills}
                                                </p>

                                            </div>

                                        </div>

                                    </td>


                                    <td>
                                        {job.location}
                                    </td>


                                    <td>
                                        {job.jobType}
                                    </td>


                                    <td>
                                        {job.deadline}
                                    </td>


                                    <td>

                                            <span className="applicant-count">

                                                {applicantCounts[job.id] ?? 0}

                                            </span>

                                    </td>


                                    <td>

                                            <span
                                                className={`job-status ${
                                                    jobStatus === "Active"
                                                        ? "status-active"
                                                        : "status-closed"
                                                }`}
                                            >
                                                {jobStatus}
                                            </span>

                                    </td>


                                    <td>

                                        <div className="job-actions">

                                            <button
                                                className="action-view"
                                                onClick={() =>
                                                    navigate(
                                                        `/jobsRecuriter/${job.id}`
                                                    )
                                                }
                                            >
                                                View
                                            </button>


                                            <button
                                                className="action-edit"
                                                onClick={() =>
                                                    setEditJob({
                                                        ...job
                                                    })
                                                }
                                            >
                                                Edit
                                            </button>

                                        </div>

                                    </td>

                                </tr>

                            );

                        })

                    )}

                    </tbody>

                </table>

            </div>


            {/* EDIT POPUP */}

            {editJob && (

                <div className="edit-modal-overlay">

                    <div className="edit-modal">

                        <div className="edit-modal-header">

                            <div>

                                <h2>
                                    Edit Job
                                </h2>

                                <p>
                                    Update your job details
                                </p>

                            </div>

                            <button
                                className="edit-close-button"
                                onClick={() =>
                                    setEditJob(null)
                                }
                            >
                                ×
                            </button>

                        </div>


                        <div className="edit-form">

                            {/* COMPANY - DISABLED */}

                            <div className="edit-form-group">

                                <label>
                                    Company
                                </label>

                                <input
                                    type="text"
                                    name="company"
                                    value={editJob.company || ""}
                                    disabled
                                />

                            </div>


                            {/* TITLE */}

                            <div className="edit-form-group">

                                <label>
                                    Job Title
                                </label>

                                <input
                                    type="text"
                                    name="title"
                                    value={editJob.title || ""}
                                    onChange={handleEditChange}
                                />

                            </div>


                            {/* LOCATION */}

                            <div className="edit-form-group">

                                <label>
                                    Location
                                </label>

                                <input
                                    type="text"
                                    name="location"
                                    value={editJob.location || ""}
                                    onChange={handleEditChange}
                                />

                            </div>


                            {/* JOB TYPE */}

                            <div className="edit-form-group">

                                <label>
                                    Job Type
                                </label>

                                <select
                                    name="jobType"
                                    value={editJob.jobType || ""}
                                    onChange={handleEditChange}
                                >

                                    <option value="Full Time">
                                        Full Time
                                    </option>

                                    <option value="Part Time">
                                        Part Time
                                    </option>

                                    <option value="Internship">
                                        Internship
                                    </option>

                                </select>

                            </div>


                            {/* SALARY */}

                            <div className="edit-form-group">

                                <label>
                                    Salary
                                </label>

                                <input
                                    type="text"
                                    name="salary"
                                    value={editJob.salary || ""}
                                    onChange={handleEditChange}
                                />

                            </div>


                            {/* DEADLINE */}

                            <div className="edit-form-group">

                                <label>
                                    Deadline
                                </label>

                                <input
                                    type="date"
                                    name="deadline"
                                    value={editJob.deadline || ""}
                                    onChange={handleEditChange}
                                />

                            </div>


                            {/* SKILLS */}

                            <div className="edit-form-group full-width">

                                <label>
                                    Skills
                                </label>

                                <input
                                    type="text"
                                    name="skills"
                                    value={editJob.skills || ""}
                                    onChange={handleEditChange}
                                />

                            </div>


                            {/* ELIGIBILITY */}

                            <div className="edit-form-group full-width">

                                <label>
                                    Eligibility
                                </label>

                                <textarea
                                    name="eligibility"
                                    value={editJob.eligibility || ""}
                                    onChange={handleEditChange}
                                />

                            </div>


                            {/* DESCRIPTION */}

                            <div className="edit-form-group full-width">

                                <label>
                                    Description
                                </label>

                                <textarea
                                    name="description"
                                    value={editJob.description || ""}
                                    onChange={handleEditChange}
                                />

                            </div>


                            {/* RESPONSIBILITIES */}

                            <div className="edit-form-group full-width">

                                <label>
                                    Responsibilities
                                </label>

                                <textarea
                                    name="responsibilities"
                                    value={editJob.responsibilities || ""}
                                    onChange={handleEditChange}
                                />

                            </div>

                        </div>


                        {/* BUTTONS */}

                        <div className="edit-modal-actions">

                            <button
                                className="edit-cancel-button"
                                onClick={() =>
                                    setEditJob(null)
                                }
                            >
                                Cancel
                            </button>

                            <button
                                className="edit-save-button"
                                onClick={handleUpdateJob}
                            >
                                Save Changes
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>

    );

};

export default ManageJobs;