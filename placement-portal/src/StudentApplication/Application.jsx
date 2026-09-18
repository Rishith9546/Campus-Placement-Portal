import "./Application.css";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {Headers} from "../Student/Headers.jsx";

export function Application() {

    const navigate = useNavigate();

    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

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

    if (loading) {
        return (
            <div className="applications-page">
                <h2>Loading applications...</h2>
            </div>
        );
    }
    console.log(applications)

    return (
        <>
        <Headers/>
        <div className="applications-page">

            <div className="applications-header">

                <h1>My Applications</h1>

                <p>
                    Track all your job applications
                </p>

            </div>

            {applications.length === 0 ? (

                <div className="no-applications">

                    <h2>No Applications Yet</h2>

                    <p>
                        You haven't applied for any jobs yet.
                    </p>

                    <button onClick={() => navigate("/viewjobs")}>
                        View Jobs
                    </button>

                </div>

            ) : (

                <div className="applications-container">

                    {applications.map((application) => (

                        <div
                            className="application-card"
                            key={application.id}
                        >

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

                            <div className="application-details">

                                <p>
                                    <strong>Location:</strong>{" "}
                                    {application.job?.location ||
                                        application.location ||
                                        "Not specified"}
                                </p>

                                <p>
                                    <strong>Job Type:</strong>{" "}
                                    {application.job?.jobType ||
                                        application.jobType ||
                                        "Not specified"}
                                </p>

                                <p>
                                    <strong>Salary:</strong>{" "}
                                    {application.job?.salary ||
                                        application.salary ||
                                        "Not specified"}
                                </p>

                                <p>
                                    <strong>Applied On:</strong>{" "}
                                    {application.appliedAt
                                        ? new Date(
                                            application.appliedAt
                                        ).toLocaleDateString()
                                        : "Not available"}
                                </p>

                            </div>

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

                    ))}

                </div>

            )}

        </div>
            </>
    );
}