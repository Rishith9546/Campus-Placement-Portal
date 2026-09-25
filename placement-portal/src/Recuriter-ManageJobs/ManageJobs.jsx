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

            }
        };

        getAllJobs();

    }, []);



    useEffect(() => {

        if (jobs.length === 0) {
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


    console.log(jobs);
    console.log(applicantCounts);


    return (
        <div className="manage-jobs-page">




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
                    />

                </div>


                <select>

                    <option>
                        All Jobs
                    </option>

                    <option>
                        Active
                    </option>

                    <option>
                        Closed
                    </option>

                </select>

            </div>


            {/* JOB TABLE */}

            <div className="job-table-wrapper">

                <table className="job-list-table">


                    {/* TABLE HEADER */}

                    <thead>

                    <tr>

                        <th>
                            Job
                        </th>

                        <th>
                            Location
                        </th>

                        <th>
                            Type
                        </th>

                        <th>
                            Deadline
                        </th>

                        <th>
                            Applicants
                        </th>

                        <th>
                            Status
                        </th>

                        <th>
                            Actions
                        </th>

                    </tr>

                    </thead>


                    {/* TABLE BODY */}

                    <tbody>

                    {jobs.map((job) => {


                        // CALCULATE JOB STATUS

                        const jobStatus = job.deadline
                            ? new Date() <=
                            new Date(job.deadline)
                                ? "Active"
                                : "Closed"
                            : "Closed";


                        return (

                            <tr
                                key={job.id}
                            >


                                {/* JOB */}

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


                                {/* LOCATION */}

                                <td>
                                    {job.location}
                                </td>


                                {/* JOB TYPE */}

                                <td>
                                    {job.jobType}
                                </td>


                                {/* DEADLINE */}

                                <td>
                                    {job.deadline}
                                </td>


                                {/* APPLICANTS */}

                                <td>

                                    <span className="applicant-count">

                                        {applicantCounts[job.id] ?? 0}

                                    </span>

                                </td>


                                {/* STATUS */}

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


                                {/* ACTIONS */}

                                <td>

                                    <div className="job-actions">


                                        {/* VIEW */}

                                        <button
                                            className="action-view"
                                            onClick={() =>
                                                navigate(
                                                    `/jobs/${job.id}`
                                                )
                                            }
                                        >
                                            View
                                        </button>


                                        {/* EDIT */}

                                        <button
                                            className="action-edit"
                                            onClick={() =>
                                                navigate(
                                                    `/recruiter/edit-job/${job.id}`
                                                )
                                            }
                                        >
                                            Edit
                                        </button>


                                        {/* DELETE */}

                                        <button
                                            className="action-delete"
                                            onClick={() =>
                                                alert(
                                                    `Delete ${job.title}?`
                                                )
                                            }
                                        >
                                            Delete
                                        </button>

                                    </div>

                                </td>


                            </tr>

                        );

                    })}

                    </tbody>

                </table>

            </div>

        </div>
    );
};

export default ManageJobs;