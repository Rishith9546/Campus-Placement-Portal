import './StatsCard.css';
import { useEffect, useState } from "react";
import axios from "axios";

export function StatsCard() {

    const [jobs, setJobs] = useState(0);
    const [applicants, setApplicants] = useState(0);
    const [shortlisted, setShortlisted] = useState(0);

    const countActiveJobs = async () => {
        const token = localStorage.getItem("token");

        const response = await axios.get(
            "http://localhost:8080/api/jobs/count",
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        setJobs(response.data);
    };

    const countApplicants = async () => {
        const token = localStorage.getItem("token");

        const response = await axios.get(
            "http://localhost:8080/api/applications/count",
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        setApplicants(response.data);
    };

    const countShortlisted = async () => {
        const token = localStorage.getItem("token");

        const response = await axios.get(
            "http://localhost:8080/api/applications/shortlisted/count",
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        setShortlisted(response.data);
    };

    useEffect(() => {
        countActiveJobs();
        countApplicants();
        countShortlisted();
    }, []);

    return (
        <>
            <div className="stats-container">

                <div className="card one">
                    <div className="icon">💼</div>
                    <p>Active Jobs</p>
                    <strong>{jobs}</strong>
                </div>

                <div className="card two">
                    <div className="icon">👥</div>
                    <p>Applicants</p>
                    <strong>{applicants}</strong>
                </div>

                <div className="card three">
                    <div className="icon">✅</div>
                    <p>Shortlisted</p>
                    <strong>{shortlisted}</strong>
                </div>

            </div>
        </>
    );
}