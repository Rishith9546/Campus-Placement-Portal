import React, { useState } from "react";
import axios from "axios";
import "./PostJob.css";

export function PostJob({ onClose }) {
    const [addJob, setAddJob] = useState({
        title: "",
        company: "",
        location: "",
        jobType: "",
        salary: "",
        description: "",
        eligibility: "",
        skills: "",
        responsibilities: "",
        deadline: ""
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem("token");

            const response = await axios.post(
                "http://localhost:8080/api/jobs/addJob",
                addJob,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            console.log("Job posted successfully");
            console.log(response.data);

            onClose();

        } catch (error) {
            console.log("Error posting job:", error);
        }
    };

    return (
        <div className="modal-overlay">

            <div className="post-job-modal">

                <div className="post-job-header">

                    <h2>Post a New Job</h2>

                    <button
                        type="button"
                        className="close-btn"
                        onClick={onClose}
                    >
                        ✕
                    </button>

                </div>

                <form onSubmit={handleSubmit}>

                    <div className="form-grid">

                        <div className="form-group">
                            <label>Job Title</label>

                            <input
                                type="text"
                                placeholder="e.g. Java Developer"
                                required
                                value={addJob.title}
                                onChange={(e) =>
                                    setAddJob({
                                        ...addJob,
                                        title: e.target.value
                                    })
                                }
                            />
                        </div>

                        <div className="form-group">
                            <label>Company</label>

                            <input
                                type="text"
                                placeholder="Company name"
                                required
                                value={addJob.company}
                                onChange={(e) =>
                                    setAddJob({
                                        ...addJob,
                                        company: e.target.value
                                    })
                                }
                            />
                        </div>

                        <div className="form-group">
                            <label>Location</label>

                            <input
                                type="text"
                                placeholder="e.g. Bangalore"
                                required
                                value={addJob.location}
                                onChange={(e) =>
                                    setAddJob({
                                        ...addJob,
                                        location: e.target.value
                                    })
                                }
                            />
                        </div>

                        <div className="form-group">
                            <label>Job Type</label>

                            <select
                                required
                                value={addJob.jobType}
                                onChange={(e) =>
                                    setAddJob({
                                        ...addJob,
                                        jobType: e.target.value
                                    })
                                }
                            >
                                <option value="">
                                    Select job type
                                </option>

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

                        <div className="form-group">
                            <label>Salary</label>

                            <input
                                type="text"
                                placeholder="e.g. 8-12 LPA"
                                value={addJob.salary}
                                onChange={(e) =>
                                    setAddJob({
                                        ...addJob,
                                        salary: e.target.value
                                    })
                                }
                            />
                        </div>

                        <div className="form-group">
                            <label>Application Deadline</label>

                            <input
                                type="date"
                                required
                                value={addJob.deadline}
                                onChange={(e) =>
                                    setAddJob({
                                        ...addJob,
                                        deadline: e.target.value
                                    })
                                }
                            />
                        </div>

                    </div>

                    <div className="form-group full-width">
                        <label>Skills</label>

                        <input
                            type="text"
                            placeholder="e.g. Java, Spring Boot, SQL, Git"
                            required
                            value={addJob.skills}
                            onChange={(e) =>
                                setAddJob({
                                    ...addJob,
                                    skills: e.target.value
                                })
                            }
                        />
                    </div>

                    <div className="form-group full-width">
                        <label>Eligibility</label>

                        <textarea
                            rows="3"
                            placeholder="Enter eligibility criteria"
                            required
                            value={addJob.eligibility}
                            onChange={(e) =>
                                setAddJob({
                                    ...addJob,
                                    eligibility: e.target.value
                                })
                            }
                        ></textarea>
                    </div>

                    <div className="form-group full-width">
                        <label>Job Description</label>

                        <textarea
                            rows="4"
                            placeholder="Describe the job"
                            required
                            value={addJob.description}
                            onChange={(e) =>
                                setAddJob({
                                    ...addJob,
                                    description: e.target.value
                                })
                            }
                        ></textarea>
                    </div>

                    <div className="form-group full-width">
                        <label>Responsibilities</label>

                        <textarea
                            rows="4"
                            placeholder="Enter job responsibilities"
                            required
                            value={addJob.responsibilities}
                            onChange={(e) =>
                                setAddJob({
                                    ...addJob,
                                    responsibilities: e.target.value
                                })
                            }
                        ></textarea>
                    </div>

                    <div className="form-actions">

                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={onClose}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="post-btn"
                        >
                            Post Job
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}

export default PostJob;