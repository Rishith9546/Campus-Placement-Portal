import { useState } from "react";
import { Headers } from "../Student/Headers.jsx";
import { ProfileCard } from "./ProfileCard.jsx";
import { QuickActions } from "./QuickActions.jsx";
import { PostJob } from "./PostJob.jsx";
import { RecruiterOverview } from "./RecruiterOverview.jsx";

import "./RecuriterDashbaord.css";

export function RecruiterDashboard() {

    const [showPostJob, setShowPostJob] = useState(false);
    const [company, setCompany] = useState("");
    const [overviewVersion, setOverviewVersion] = useState(0);
    return (
        <div className="recruiter-dashboard">
            <Headers />

            <div className="body">

                <ProfileCard  setCompany={setCompany}/>

                <RecruiterOverview
                    key={overviewVersion}
                    company={company}
                    onPostJob={() => setShowPostJob(true)}
                />

                <QuickActions
                    onPostJob={() => setShowPostJob(true)}
                    company={company}
                />

            </div>

            {showPostJob && (
                <PostJob
                    onClose={() => setShowPostJob(false)}
                    company={company}
                    onPosted={() => setOverviewVersion((version) => version + 1)}
                />
            )}

        </div>
    );
}

export default RecruiterDashboard;
