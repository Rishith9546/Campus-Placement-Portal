import "./QuickActions.css";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, BriefcaseBusiness, CheckCircle2, Plus, UsersRound } from "lucide-react";

export function QuickActions({ onPostJob }) {
    const navigate = useNavigate();
    const actions = [
        { title: "Post a job", detail: "Share a new opportunity", icon: Plus, action: onPostJob },
        { title: "Manage jobs", detail: "Edit and track openings", icon: BriefcaseBusiness, action: () => navigate("/recruiter/manage-jobs") },
        { title: "Review applicants", detail: "Explore student profiles", icon: UsersRound, action: () => navigate("/recruiter/applicants") },
        { title: "Shortlisted", detail: "Continue candidate follow-up", icon: CheckCircle2, action: () => navigate("/recruiter/shortlisted") },
    ];

    return (
        <section className="quick-actions">
            <div className="quick-actions-heading"><div><span>KEEP THINGS MOVING</span><h2>Quick actions</h2></div></div>
            <div className="quick-actions-container">
                {actions.map(({ title, detail, icon: Icon, action }) => (
                    <button className="quick-action" type="button" key={title} onClick={action}>
                        <span className="quick-action-icon"><Icon size={19} /></span>
                        <span className="quick-action-copy"><strong>{title}</strong><small>{detail}</small></span>
                        <ArrowUpRight className="quick-action-arrow" size={16} />
                    </button>
                ))}
            </div>
        </section>
    );
}

export default QuickActions;
