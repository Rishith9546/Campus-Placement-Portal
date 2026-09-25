import { useState } from "react";
import { Headers } from "../Student/Headers.jsx";
import { ProfileCard } from "./ProfileCard.jsx";
import { StatsCard } from "./StatsCard.jsx";
import { RecentJobs } from "./RecentJobs.jsx";
import { QuickActions } from "./QuickActions.jsx";
import { PostJob } from "./PostJob.jsx";

import "./RecuriterDashbaord.css";

export function RecruiterDashboard() {

    const [showPostJob, setShowPostJob] = useState(false);
    const[company,setCompany]=useState();
    console.log(company);
    return (
        <div>
            <Headers />

            <div className="body">

                <ProfileCard  setCompany={setCompany}/>

                <StatsCard />

                <RecentJobs
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
                />
            )}

        </div>
    );
}

export default RecruiterDashboard;