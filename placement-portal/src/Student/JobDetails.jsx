import './JobDetails.css';
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useState, useEffect } from "react";

export function JobDetails() {

    const navigate = useNavigate();
    const { id } = useParams();

    const [details, setDetails] = useState(null);
    const [users, setUsers] = useState(null);
    const [applicationId, setApplicationId] = useState(null);
    const [status, setStatus] = useState(null);

    console.log(id);

    // GET STUDENT PROFILE
    useEffect(() => {

        const getUser = async () => {

            try {

                const token = localStorage.getItem("token");

                const response = await axios.get(
                    "http://localhost:8080/api/student/profile",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                setUsers(response.data);

            } catch (error) {
                console.log(error);
            }
        };

        getUser();

    }, []);


    // GET JOB BY ID
    useEffect(() => {

        const jobsByID = async () => {

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
                console.log(error);
            }
        };

        jobsByID();

    }, [id]);


    // GET APPLICATION
    useEffect(() => {

        if (!users) {
            return;
        }

        const getApplication = async () => {

            try {

                const token = localStorage.getItem("token");

                const response = await axios.get(
                    `http://localhost:8080/api/applications/student/${users.id}/job/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                console.log(response.data);

                setApplicationId(response.data.id);

            } catch (error) {

                if (error.response?.status === 404) {
                    setApplicationId(null);
                    setStatus(null);
                } else {
                    console.log(error);
                }

            }
        };

        getApplication();

    }, [users, id]);


    // GET APPLICATION STATUS
    useEffect(() => {

        if (!applicationId) {
            return;
        }

        const getStatus = async () => {

            try {

                const token = localStorage.getItem("token");

                const response = await axios.get(
                    `http://localhost:8080/api/applications/getStatus/${applicationId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                console.log(response.data);

                setStatus(response.data);

            } catch (error) {
                console.log(error);
            }
        };

        getStatus();

    }, [applicationId]);


    // APPLY FOR JOB
    const applyFunction = async () => {

        try {

            const token = localStorage.getItem("token");

            const application = {
                studentId: users.id,
                jobId: id,
                appliedAt: new Date().toISOString(),
                status: "APPLIED",
                rejectionReason: null
            };

            const response = await axios.post(
                "http://localhost:8080/api/applications/applied",
                application,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            console.log(response.data);

            setApplicationId(response.data.id);
            setStatus(response.data.status);

        } catch (error) {
            console.log(error);
        }
    };


    const skills = details?.skills
        ? details.skills.split(",")
        : [];


    const responsibilities = details?.responsibilities
        ? details.responsibilities.split("|")
        : [];


    const date = details?.deadline
        ? new Date(details.deadline)
        : null;


    const formattedDeadline = date
        ? `${date.getDate()} ${date.toLocaleString("en-GB", {
            month: "long"
        })}, ${date.getFullYear()}`
        : "";


    return (
        <div className="job-page">

            <div className="job-navigation">

                <button onClick={() => navigate('/viewjobs')}>
                    ← Back to Jobs
                </button>

                <button onClick={() => {
                    navigate('/application');
                }}>
                    ← Back To Application
                </button>

            </div>


            <div className="job-banner">

                <div>

                    <h1>
                        {details?.title}
                    </h1>

                    <h3>
                        {details?.company}
                    </h3>

                    <p>
                        📍 {details?.location}
                    </p>

                    <p>
                        💼 {details?.jobType}
                    </p>

                </div>


                <button
                    onClick={applyFunction}
                    className={status === "APPLIED" ? "job-applied" : ""}
                    disabled={
                        status === "APPLIED" ||
                        status === "SHORTLISTED" ||
                        status === "REJECTED"
                    }
                >

                    {status === "APPLIED"
                        ? "✓ Applied"
                        : status === "SHORTLISTED"
                            ? "✓ Shortlisted"
                            : status === "REJECTED"
                                ? "✕ Rejected"
                                : "Apply Now"
                    }

                </button>

            </div>


            <div className="job-content-section">

                <h2>Job Description</h2>

                <p>
                    {details?.description}
                </p>

            </div>


            <div className="job-content-section">

                <h2>Skills Required</h2>

                <ul>

                    {skills.map((skill, index) => (
                        <li key={index}>
                            {skill.trim()}
                        </li>
                    ))}

                </ul>

            </div>


            <div className="job-content-section">

                <h2>Eligibility</h2>

                <p>
                    {details?.eligibility}
                </p>

            </div>


            <div className="job-content-section">

                <h2>Responsibilities</h2>

                <ul>

                    {responsibilities.map((res, index) => (
                        <li key={index}>
                            {res.trim()}
                        </li>
                    ))}

                </ul>

            </div>


            <div className="job-content-section">

                <h2>Job Information</h2>

                <p>
                    <strong>Salary:</strong> {details?.salary}
                </p>

                <p>
                    <strong>Location:</strong> {details?.location}
                </p>

                <p>
                    <strong>Job Type:</strong> {details?.jobType}
                </p>

                <p>
                    <strong>Application Deadline:</strong> {formattedDeadline}
                </p>

            </div>

        </div>
    );
}