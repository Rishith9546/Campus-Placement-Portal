import "./QuickActions.css";
import { useNavigate } from "react-router-dom";

export function QuickActions({ onPostJob }) {

    const navigate = useNavigate();

    return (
        <div className="quick-actions">

            <h2>Quick Actions</h2>

            <div className="quick-actions-container">

                <div
                    className="quick-action"
                    onClick={onPostJob}
                >
                    <span>➕</span>
                    <p>Post New Job</p>
                </div>


                <div
                    className="quick-action"
                    onClick={() => navigate("/recruiter/jobs")}
                >
                    <span>💼</span>
                    <p>Manage Jobs</p>
                </div>


                <div
                    className="quick-action"
                    onClick={() => navigate("/recruiter/applicants")}
                >
                    <span>👥</span>
                    <p>View Applicants</p>
                </div>


                <div
                    className="quick-action"
                    onClick={() => navigate("/recruiter/shortlisted")}
                >
                    <span>✅</span>
                    <p>Shortlisted</p>
                </div>

            </div>

        </div>
    );
}

export default QuickActions;