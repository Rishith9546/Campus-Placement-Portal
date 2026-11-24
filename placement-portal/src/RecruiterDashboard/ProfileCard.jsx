import { useEffect, useState } from "react";
import axios from "axios";
import "./ProfileCard.css";

export function ProfileCard({ setCompany }) {

    const [recruiter, setRecruiter] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {

        const getRecruiterProfile = async () => {

            try {

                const token = localStorage.getItem("token");

                const response = await axios.get(
                    "http://localhost:8080/api/recruiter/profile",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                setRecruiter(response.data);
                setErrorMessage("");

            } catch (error) {

                console.error(
                    "Error fetching recruiter profile:",
                    error
                );
                setErrorMessage("We couldn't load your recruiter profile. Refresh to try again.");
            } finally {
                setLoading(false);

            }
        };

        getRecruiterProfile();

    }, []);
    // This hook MUST be before the if return
    useEffect(() => {

        if (recruiter) {
            setCompany(recruiter.companyName);
        }

    }, [recruiter, setCompany]);


    // Conditional return AFTER all hooks
    if (loading) {
        return <section className="recruiter-profile recruiter-profile-state" role="status">Loading your profile...</section>;
    }

    if (!recruiter) {
        return <section className="recruiter-profile recruiter-profile-state" role="alert">{errorMessage || "Recruiter profile is unavailable."}</section>;
    }

    const initials = (recruiter.name || recruiter.companyName || "R")
        .trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();


    return (
        <section className="recruiter-profile">
            <header className="recruiter-profile-header">
                <span className="recruiter-avatar" aria-label={`${recruiter.name || "Recruiter"} initials`}>{initials}</span>
                <div className="recruiter-profile-intro">
                    <span className="recruiter-profile-eyebrow">RECRUITER WORKSPACE</span>
                    <h2>{recruiter.name ? `Welcome, ${recruiter.name}` : "Welcome back"}</h2>
                    <p>{recruiter.companyName || "Your hiring workspace"}</p>
                </div>
                <span className="recruiter-role-chip">Recruiter</span>
            </header>

            <div className="profile-details">

                <div className="detail-item">
                    <span>Name</span>
                    <strong>{recruiter.name || "Not provided"}</strong>
                </div>

                <div className="detail-item">
                    <span>Company</span>
                    <strong>{recruiter.companyName || "Not provided"}</strong>
                </div>

                <div className="detail-item">
                    <span>Email</span>
                    <strong>{recruiter.email || "Not provided"}</strong>
                </div>

                <div className="detail-item">
                    <span>Role</span>
                    <strong className="role-badge">
                        Recruiter
                    </strong>
                </div>

            </div>
        </section>
    );
}

export default ProfileCard;
