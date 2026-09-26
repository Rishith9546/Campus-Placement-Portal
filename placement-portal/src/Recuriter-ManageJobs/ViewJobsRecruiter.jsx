import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import "./ViewJobsRecuriter.css";
import axios from "axios";

export function ViewJobsRecruiter() {

    const { id } = useParams();

    const [details, setDetails] = useState(null);

    useEffect(() => {

        const jobDetails = async () => {

            try {

                const token = localStorage.getItem("token");

                const response = await axios.get(
                    `http://localhost:8080/api/jobs/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                setDetails(response.data);

            } catch (error) {

                console.error(
                    "Error fetching job details:",
                    error
                );

            }

        };

        jobDetails();

    }, [id]);

    if (!details) {
        return <div className="job-loading">Loading...</div>;
    }

    return (

        <div className="job-view-page">

            <div className="job-view-container">

                {/* HEADER */}

                <div className="job-header-card">

                    <div className="company-logo">
                        {details.company?.charAt(0)}
                    </div>

                    <div className="job-heading">

                        <h1>{details.title}</h1>

                        <h2>{details.company}</h2>

                    </div>

                </div>


                {/* BASIC DETAILS */}

                <div className="job-basic-info">


                    <div className="info-item">
                        <span>Location</span>
                        <strong>{details.location}</strong>
                    </div>

                    <div className="info-item">
                        <span>Job Type</span>
                        <strong>{details.jobType}</strong>
                    </div>

                    <div className="info-item">
                        <span>Salary</span>
                        <strong>{details.salary}</strong>
                    </div>

                    <div className="info-item">
                        <span>Deadline</span>
                        <strong>{details.deadline}</strong>
                    </div>

                </div>


                {/* DESCRIPTION */}

                <div className="job-section-card">

                    <h3>Description</h3>

                    <p>
                        {details.description}
                    </p>

                </div>


                {/* ELIGIBILITY */}

                <div className="job-section-card">

                    <h3>Eligibility</h3>

                    <p>
                        {details.eligibility}
                    </p>

                </div>


                {/* SKILLS */}

                <div className="job-section-card">

                    <h3>Skills</h3>

                    <div className="skills-list">

                        {details.skills?.split(",").map(
                            (skill, index) => (

                                <span
                                    className="skill-item"
                                    key={index}
                                >
                                    {skill.trim()}
                                </span>

                            )
                        )}

                    </div>

                </div>


                {/* RESPONSIBILITIES */}

                <div className="job-section-card">

                    <h3>Responsibilities</h3>

                    <ul className="responsibility-list">

                        {details.responsibilities
                            ?.split("|")
                            .map((responsibility, index) => (

                                <li key={index}>
                                    {responsibility.trim()}
                                </li>

                            ))}

                    </ul>

                </div>


                {/* EXTRA DETAILS */}

                <div className="job-extra-details">
                    

                    <div className="extra-item">

                        <span>Created At</span>

                        <strong>
                            {details.createdAt}
                        </strong>

                    </div>

                </div>

            </div>

        </div>

    );

}