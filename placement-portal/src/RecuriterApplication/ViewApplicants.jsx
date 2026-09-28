import './ViewApplicants.css';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { SlidersHorizontal } from "lucide-react";

export function ViewApplicants() {

    const navigate = useNavigate();

    const [applications, setApplications] = useState([]);
    const [selectedApplicant, setSelectedApplicant] = useState(null);

    const [showFilter, setShowFilter] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState("ALL");
    const [appliedFilter, setAppliedFilter] = useState("ALL");


    useEffect(() => {

        const getApplicants = async () => {

            try {

                const token = localStorage.getItem("token");

                const response = await axios.get(
                    "http://localhost:8080/api/applications/recruiter/applicants",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                setApplications(response.data);

            } catch (error) {

                console.log(error);

            }

        };

        getApplicants();

    }, []);


    const viewResume = async (application) => {

        const filename = application.student.resume;

        if (!filename) {
            toast.error("No resume uploaded.");
            return;
        }

        const token = localStorage.getItem("token");

        if (!token) {
            toast.error("Please login again.");
            return;
        }

        try {

            const response = await axios.get(
                `http://localhost:8080/api/student/resume/${encodeURIComponent(filename)}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    responseType: "blob"
                }
            );

            const pdfUrl = URL.createObjectURL(response.data);

            window.open(pdfUrl, "_blank");

        } catch (error) {

            console.error("Error opening resume:", error);

            toast.error("Unable to view resume.");

        }

    };


    const shortlist = async (application) => {

        try {

            const token = localStorage.getItem("token");

            await axios.put(
                `http://localhost:8080/api/applications/shortlist/${application.id}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setApplications((prevApplications) =>
                prevApplications.map((app) =>
                    app.id === application.id
                        ? {
                            ...app,
                            status: "SHORTLISTED"
                        }
                        : app
                )
            );

            toast.success("Applicant shortlisted");

        } catch (error) {

            console.error("Error shortlisting applicant:", error);

            toast.error("Unable to shortlist applicant");

        }

    };


    const reject = async (application) => {

        try {

            const token = localStorage.getItem("token");

            await axios.put(
                `http://localhost:8080/api/applications/rejected/${application.id}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setApplications((prevApplications) =>
                prevApplications.map((app) =>
                    app.id === application.id
                        ? {
                            ...app,
                            status: "REJECTED"
                        }
                        : app
                )
            );

            toast.success("Applicant rejected");

        } catch (error) {

            console.error("Error reject applicant:", error);

            toast.error("Unable to reject applicant");

        }

    };


    const filteredApplications = applications.filter((application) => {

        if (appliedFilter === "ALL") {
            return true;
        }

        return application.status === appliedFilter;

    });


    const applyFilter = () => {

        setAppliedFilter(selectedStatus);

        setShowFilter(false);

    };


    return (

        <div className="view-applicants-page">

            <div className="button-part">

                <button
                    onClick={() => {
                        navigate('/recruiterDashboard');
                    }}
                    className="back-button"
                >
                    ← Back To Profile
                </button>


                <button
                    className="filter-button"
                    onClick={() => {
                        setSelectedStatus(appliedFilter);
                        setShowFilter(true);
                    }}
                >
                    <SlidersHorizontal size={20} />
                </button>

            </div>


            {showFilter && (

                <div
                    className="filter-popup-overlay"
                    onClick={() => setShowFilter(false)}
                >

                    <div
                        className="filter-popup"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <button
                            className="filter-popup-close"
                            onClick={() => setShowFilter(false)}
                        >
                            ×
                        </button>


                        <h2>Filter Applicants</h2>


                        <div className="filter-option">

                            <label>
                                <input
                                    type="radio"
                                    name="status"
                                    value="ALL"
                                    checked={selectedStatus === "ALL"}
                                    onChange={() => setSelectedStatus("ALL")}
                                />
                                All
                            </label>

                            <label>
                                <input
                                    type="radio"
                                    name="status"
                                    value="SHORTLISTED"
                                    checked={selectedStatus === "SHORTLISTED"}
                                    onChange={() => setSelectedStatus("SHORTLISTED")}
                                />
                                Shortlisted
                            </label>


                            <label>
                                <input
                                    type="radio"
                                    name="status"
                                    value="REJECTED"
                                    checked={selectedStatus === "REJECTED"}
                                    onChange={() => setSelectedStatus("REJECTED")}
                                />
                                Rejected
                            </label>

                        </div>


                        <button
                            className="apply-filter-button"
                            onClick={applyFilter}
                        >
                            Apply Filter
                        </button>

                    </div>

                </div>

            )}


            <div className="view-applicants-header">

                <h1>Applicants</h1>

                <p>
                    View and manage applicants for your jobs
                </p>

            </div>


            <div className="view-applicants-container">

                {filteredApplications.map((application) => (

                    <div
                        className="view-applicant-card"
                        key={application.id}
                    >

                        <div className="view-applicant-header">

                            <div>

                                <h2>
                                    {application.student.name}
                                </h2>

                                <p>
                                    {application.student.email}
                                </p>

                            </div>


                            <span>
                                {application.status}
                            </span>

                        </div>


                        <div className="view-job-info">

                            <h3>Applied For</h3>

                            <p>
                                Job: {application.job.title}
                            </p>

                            <p>
                                Company: {application.job.company}
                            </p>

                        </div>


                        <div className="view-student-details">

                            <p>
                                Branch: {application.student.branch}
                            </p>

                            <p>
                                CGPA: {application.student.cgpa}
                            </p>

                            <p>
                                Phone: {application.student.phone}
                            </p>

                            <p>
                                Skills: {application.student.skills}
                            </p>

                            <p>
                                Applied On: {
                                new Date(
                                    application.appliedAt
                                ).toLocaleDateString(
                                    "en-GB",
                                    {
                                        day: "2-digit",
                                        month: "long",
                                        year: "numeric"
                                    }
                                )
                            }
                            </p>

                        </div>


                        <div className="view-applicant-actions">

                            <button
                                onClick={() => {
                                    setSelectedApplicant(application);
                                }}
                            >
                                View Profile
                            </button>


                            <button
                                onClick={() => {
                                    viewResume(application);
                                }}
                            >
                                View Resume
                            </button>


                            <button
                                onClick={() => shortlist(application)}
                                disabled={
                                    application.status === "SHORTLISTED" ||
                                    application.status === "REJECTED"
                                }
                            >
                                {
                                    application.status === "SHORTLISTED"
                                        ? "Shortlisted"
                                        : "Shortlist"
                                }
                            </button>


                            <button
                                onClick={() => {
                                    reject(application);
                                }}
                                disabled={
                                    application.status === "REJECTED"
                                }
                            >
                                {
                                    application.status !== "REJECTED"
                                        ? "Reject"
                                        : "Rejected"
                                }
                            </button>

                        </div>

                    </div>

                ))}

            </div>


            {filteredApplications.length === 0 && (

                <div className="view-applicants-header">

                    <p>
                        No applicants found for this filter.
                    </p>

                </div>

            )}


            {selectedApplicant && (

                <div
                    className="profile-popup-overlay"
                    onClick={() => {
                        setSelectedApplicant(null);
                    }}
                >

                    <div
                        className="profile-popup"
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                    >

                        <button
                            className="profile-popup-close"
                            onClick={() => {
                                setSelectedApplicant(null);
                            }}
                        >
                            ×
                        </button>


                        {selectedApplicant.student.profilePhoto ? (

                            <img
                                className="profile-popup-photo"
                                src={`http://localhost:8080/api/student/photo/${encodeURIComponent(
                                    selectedApplicant.student.profilePhoto
                                )}`}
                                alt={selectedApplicant.student.name}
                            />

                        ) : (

                            <div className="profile-popup-no-photo">
                                No Photo
                            </div>

                        )}


                        <h2>Student Profile</h2>


                        <div className="profile-popup-details">

                            <p>
                                <strong>Name:</strong>{" "}
                                {selectedApplicant.student.name}
                            </p>

                            <p>
                                <strong>Email:</strong>{" "}
                                {selectedApplicant.student.email}
                            </p>

                            <p>
                                <strong>Phone:</strong>{" "}
                                {selectedApplicant.student.phone}
                            </p>

                            <p>
                                <strong>Branch:</strong>{" "}
                                {selectedApplicant.student.branch}
                            </p>

                            <p>
                                <strong>CGPA:</strong>{" "}
                                {selectedApplicant.student.cgpa}
                            </p>

                            <p>
                                <strong>Skills:</strong>{" "}
                                {selectedApplicant.student.skills}
                            </p>

                            <p>
                                <strong>Applied On:</strong>{" "}
                                {
                                    new Date(
                                        selectedApplicant.appliedAt
                                    ).toLocaleDateString("en-GB")
                                }
                            </p>

                        </div>


                        <button
                            className="close-profile-button"
                            onClick={() => {
                                setSelectedApplicant(null);
                            }}
                        >
                            Close
                        </button>

                    </div>

                </div>

            )}


            <ToastContainer />

        </div>

    );

}