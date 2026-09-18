import "./RecentJobs.css";
import axios from "axios";
import { useState, useEffect } from "react";

export function RecentJobs({ onPostJob }) {

    const [jobs, setJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);

    useEffect(() => {

        const getRecentJobs = async () => {

            try {

                const token = localStorage.getItem("token");

                const response = await axios.get(
                    "http://localhost:8080/api/jobs/recent",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                setJobs(response.data);

            } catch (error) {

                console.log(error);

            }

        };

        getRecentJobs();

    }, []);


    return (

        <div className="recent-jobs">

            <div className="recent-jobs-header">

                <h2>Recent Jobs</h2>

                <button
                    type="button"
                    className="add-job-btn"
                    onClick={onPostJob}
                >
                    + Post New Job
                </button>

            </div>


            <div className="job-list">

                {jobs.map((job) => {

                    const today = new Date();
                    const deadline = new Date(job.deadline);

                    const isClosed = deadline < today;

                    return (

                        <div
                            className="recent-job-card"
                            key={job.id}
                        >

                            <div className="job-info">

                                <h3>{job.title}</h3>

                                <p>
                                    {job.company} • {job.location}
                                </p>

                                <span>
                                    Deadline: {job.deadline}
                                </span>

                            </div>


                            <div className="job-action">

                                <span
                                    className={`job-status ${
                                        isClosed ? "closed" : ""
                                    }`}
                                >
                                    {isClosed ? "Closed" : "Active"}
                                </span>


                                <button
                                    type="button"
                                    onClick={() => setSelectedJob(job)}
                                >
                                    View
                                </button>

                            </div>

                        </div>

                    );

                })}

            </div>


            {/* Job Details Modal */}

            {selectedJob && (

                <div className="job-modal-overlay">

                    <div className="job-modal">

                        <div className="job-modal-header">

                            <div>
                                <h2>{selectedJob.title}</h2>

                                <p>
                                    {selectedJob.company} •{" "}
                                    {selectedJob.location}
                                </p>
                            </div>

                            <button
                                type="button"
                                className="job-modal-close"
                                onClick={() => setSelectedJob(null)}
                            >
                                ✕
                            </button>

                        </div>


                        <div className="job-modal-content">

                            <div className="job-detail-grid">

                                <div className="job-detail-item">
                                    <span>Job Type</span>
                                    <strong>
                                        {selectedJob.jobType}
                                    </strong>
                                </div>


                                <div className="job-detail-item">
                                    <span>Salary</span>
                                    <strong>
                                        {selectedJob.salary}
                                    </strong>
                                </div>


                                <div className="job-detail-item">
                                    <span>Deadline</span>
                                    <strong>
                                        {selectedJob.deadline}
                                    </strong>
                                </div>


                                <div className="job-detail-item">
                                    <span>Status</span>

                                    <strong
                                        className={
                                            new Date(selectedJob.deadline) <
                                            new Date()
                                                ? "modal-status closed"
                                                : "modal-status"
                                        }
                                    >
                                        {new Date(selectedJob.deadline) <
                                        new Date()
                                            ? "Closed"
                                            : "Active"}
                                    </strong>

                                </div>

                            </div>


                            <div className="job-detail-section">

                                <h3>Skills</h3>

                                <p>
                                    {selectedJob.skills}
                                </p>

                            </div>


                            <div className="job-detail-section">

                                <h3>Eligibility</h3>

                                <p>
                                    {selectedJob.eligibility}
                                </p>

                            </div>


                            <div className="job-detail-section">

                                <h3>Job Description</h3>

                                <p>
                                    {selectedJob.description}
                                </p>

                            </div>


                            <div className="job-detail-section">

                                <h3>Responsibilities</h3>

                                <p>
                                    {selectedJob.responsibilities}
                                </p>

                            </div>

                        </div>


                        <div className="job-modal-footer">

                            <button
                                type="button"
                                onClick={() => setSelectedJob(null)}
                            >
                                Close
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>

    );
}

export default RecentJobs;