import {toast, ToastContainer} from "react-toastify";
import { Link, useLocation } from "react-router-dom";
import { BriefcaseBusiness, LogOut } from "lucide-react";
import './Headers.css'
export function Headers(){
    const location = useLocation();
    const path = location.pathname;
    const isRecruiter = path.startsWith("/recruiter") || path.startsWith("/jobsRecuriter");
    const isAdmin = path.startsWith("/admin");
    const links = isAdmin
        ? [{ label: "Overview", to: "/adminDashboard" }]
        : isRecruiter
        ? [
            { label: "Overview", to: "/recruiterDashboard" },
            { label: "Manage jobs", to: "/recruiter/manage-jobs" },
            { label: "Applicants", to: "/recruiter/applicants" },
            { label: "Shortlisted", to: "/recruiter/shortlisted" },
        ]
        : [
            { label: "Overview", to: "/dashboard" },
            { label: "Profile", to: "/profile" },
            { label: "DSA tracker", to: "/dsa-tracker" },
            { label: "Aptitude", to: "/aptitude" },
            { label: "Find jobs", to: "/viewjobs" },
            { label: "Job matches", to: "/job-matches" },
            { label: "Resume analyzer", to: "/resume-analyzer" },
            { label: "Preparation roadmap", to: "/preparation-roadmap" },
            { label: "Applications", to: "/application" },
            { label: "Interview practice", to: "/viewjobs?practice=1" },
        ];

    // =================================================
    // LOGOUT
    // =================================================

    const logout = () => {

        localStorage.removeItem(
            "token"
        );
        localStorage.removeItem("role");

        toast.success(
            "Logged out successfully!"
        );

        setTimeout(() => {

            window.location.href = "/";

        }, 1000);
    };
    return (

        <>
            <ToastContainer
                position="top-right"
                autoClose={4000}
                newestOnTop
                closeOnClick
                pauseOnHover
                draggable
                theme="light"
            />
            <header className={`portal-header${isRecruiter ? " recruiter-header" : ""}`}>
                <Link to={isAdmin ? "/adminDashboard" : isRecruiter ? "/recruiterDashboard" : "/dashboard"} className="portal-header-brand" aria-label="Placement Portal home">
                    <span className="portal-header-mark"><BriefcaseBusiness size={17} /></span>
                    <span><strong>Placement Portal</strong><small>IIIT Kalyani</small></span>
                </Link>
                <nav className="portal-header-nav" aria-label={isAdmin ? "Administrator navigation" : isRecruiter ? "Recruiter navigation" : "Student navigation"}>
                    {links.map((link) => <Link key={link.to} to={link.to} aria-current={path === link.to ? "page" : undefined}>{link.label}</Link>)}
                </nav>
                <button className="portal-logout" type="button" onClick={logout}><LogOut size={15} /><span>Log out</span></button>
            </header>
        </>
    );
}
