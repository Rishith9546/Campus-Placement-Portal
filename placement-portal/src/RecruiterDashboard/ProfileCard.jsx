import { useEffect, useState } from "react";
import axios from "axios";
import "./ProfileCard.css";

export function ProfileCard({ setCompany }) {

    const [recruiter, setRecruiter] = useState(null);

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

            } catch (error) {

                console.error(
                    "Error fetching recruiter profile:",
                    error
                );

            }
        };

        getRecruiterProfile();

    }, []);
    console.log(recruiter)


    // This hook MUST be before the if return
    useEffect(() => {

        if (recruiter) {
            setCompany(recruiter.companyName);
        }

    }, [recruiter, setCompany]);


    // Conditional return AFTER all hooks
    if (!recruiter) {
        return <p>Loading profile...</p>;
    }


    return (
        <div className="recruiter-profile">

            <h2>Recruiter Profile</h2>

            <div className="profile-details">

                <div className="detail-item">
                    <span>Name</span>
                    <strong>{recruiter.name}</strong>
                </div>

                <div className="detail-item">
                    <span>Company</span>
                    <strong>{recruiter.companyName}</strong>
                </div>

                <div className="detail-item">
                    <span>Email</span>
                    <strong>{recruiter.email}</strong>
                </div>

                <div className="detail-item">
                    <span>Role</span>
                    <strong className="role-badge">
                        {recruiter.role}
                    </strong>
                </div>

            </div>

        </div>
    );
}

export default ProfileCard;